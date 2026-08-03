-- Catalog statuses:
-- active      - visible and orderable in TMA
-- coming_soon - visible teaser, not orderable
-- hidden      - not visible to customers

ALTER TABLE catalog_types
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'hidden';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'catalog_types_status_check'
  ) THEN
    ALTER TABLE catalog_types
      ADD CONSTRAINT catalog_types_status_check
      CHECK (status IN ('active', 'coming_soon', 'hidden'));
  END IF;
END $$;

UPDATE catalog_types
SET
  status = CASE
    WHEN slug = 'frozen' THEN 'active'
    WHEN slug = 'retort' THEN 'coming_soon'
    ELSE 'hidden'
  END,
  is_active = CASE
    WHEN slug = 'frozen' THEN TRUE
    ELSE FALSE
  END;

DROP POLICY IF EXISTS "anon_select_catalog_types" ON catalog_types;

CREATE POLICY "anon_select_catalog_types"
  ON catalog_types FOR SELECT TO anon
  USING (status IN ('active', 'coming_soon'));

-- Existing retort images now live in the retort/ folder.
UPDATE menu_items
SET image_url = CASE image_url
  WHEN 'borsh.jpeg' THEN 'retort/borsh.jpeg'
  WHEN 'solyanka.jpeg' THEN 'retort/solyanka.jpeg'
  WHEN 'harcho.jpeg' THEN 'retort/harcho.jpeg'
  WHEN 'shurpa.jpeg' THEN 'retort/shurpa.jpeg'
  WHEN 'pyktyai.jpeg' THEN 'retort/pyktyai.jpeg'
  WHEN 'siryaktyamuri.jpeg' THEN 'retort/siryaktyamuri.jpeg'
  WHEN 'befstroganov.jpeg' THEN 'retort/befstroganov.jpeg'
  WHEN 'plov.jpeg' THEN 'retort/plov.jpeg'
  WHEN 'gylyash.jpeg' THEN 'retort/gylyash.jpeg'
  WHEN 'govyadina_s_ovoshami.jpeg' THEN 'retort/govyadina_s_ovoshami.jpeg'
  WHEN 'tefteli.jpeg' THEN 'retort/tefteli.jpeg'
  ELSE image_url
END
WHERE category_id IN (
  SELECT c.id
  FROM categories c
  JOIN catalog_types t ON t.id = c.catalog_type_id
  WHERE t.slug = 'retort'
);

WITH frozen_categories AS (
  SELECT
    c.id,
    c.slug
  FROM categories c
  JOIN catalog_types t ON t.id = c.catalog_type_id
  WHERE t.slug = 'frozen'
),
frozen_items(category_slug, name, price, image_url, sort_order) AS (
  VALUES
    ('first', 'Шурпа', 9000, 'frozen/shurpa.jpeg', 1),
    ('first', 'Борщ домашний', 9000, 'frozen/borsh-domashniy.jpeg', 2),
    ('first', 'Харчо', 9000, 'frozen/harcho.jpeg', 3),
    ('first', 'Сиряктямури', 9000, 'frozen/siryaktyamuri.jpeg', 4),
    ('first', 'Грибной крем-суп', 9000, 'frozen/gribnoy-krem-sup.jpeg', 5),
    ('second', 'Бефстроганов с гречневой кашей', 10000, 'frozen/befstroganov-grechka.jpeg', 1),
    ('second', 'Бефстроганов с рисом', 10000, 'frozen/befstroganov-ris.jpeg', 2),
    ('second', 'Бефстроганов с картофельным пюре', 10000, 'frozen/befstroganov-pyure.jpeg', 3),
    ('second', 'Плов', 10000, 'frozen/plov.jpeg', 4),
    ('second', 'Котлеты с картофельным пюре', 10000, 'frozen/kotlety-pyure.jpeg', 5),
    ('second', 'Котлеты с рисом', 10000, 'frozen/kotlety-ris.jpeg', 6),
    ('second', 'Котлеты с гречневой кашей', 10000, 'frozen/kotlety-grechka.jpeg', 7),
    ('second', 'Гуляш с рисом', 10000, 'frozen/gulyash-ris.jpeg', 8),
    ('second', 'Гуляш с картофельным пюре', 10000, 'frozen/gulyash-pyure.jpeg', 9),
    ('second', 'Гуляш с гречневой кашей', 10000, 'frozen/gulyash-grechka.jpeg', 10)
)
INSERT INTO menu_items (category_id, name, price, image_url, is_active, sort_order)
SELECT
  c.id,
  i.name,
  i.price,
  i.image_url,
  TRUE,
  i.sort_order
FROM frozen_items i
JOIN frozen_categories c ON c.slug = i.category_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM menu_items existing
  WHERE existing.category_id = c.id
    AND existing.name = i.name
);
