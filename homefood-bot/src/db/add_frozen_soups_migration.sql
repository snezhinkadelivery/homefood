WITH frozen_first_category AS (
  SELECT c.id
  FROM categories c
  JOIN catalog_types t ON t.id = c.catalog_type_id
  WHERE t.slug = 'frozen'
    AND c.slug = 'first'
  LIMIT 1
),
new_items(name, price, image_url, sort_order) AS (
  VALUES
    ('Тыквенный крем-суп', 9000, 'frozen/tykvennyy-krem-sup..jpeg', 6),
    ('Пуктяй',            9000, 'frozen/pyktyai.jpeg',             7),
    ('Солянка',           9000, 'frozen/solyanka.jpeg',            8)
)
INSERT INTO menu_items (category_id, name, price, image_url, is_active, sort_order)
SELECT
  c.id,
  i.name,
  i.price,
  i.image_url,
  TRUE,
  i.sort_order
FROM new_items i
CROSS JOIN frozen_first_category c
WHERE NOT EXISTS (
  SELECT 1
  FROM menu_items existing
  WHERE existing.category_id = c.id
    AND existing.name = i.name
);
