-- =============================================================
-- HomeFood — схема базы данных Supabase
-- =============================================================

-- =============================================================
-- 1. DROP (обратный порядок зависимостей)
-- =============================================================

DROP TABLE IF EXISTS admin_tokens          CASCADE;
DROP TABLE IF EXISTS reviews               CASCADE;
DROP TABLE IF EXISTS order_status_history  CASCADE;
DROP TABLE IF EXISTS orders                CASCADE;
DROP TABLE IF EXISTS users                 CASCADE;
DROP TABLE IF EXISTS menu_items            CASCADE;
DROP TABLE IF EXISTS categories            CASCADE;
DROP TABLE IF EXISTS catalog_types         CASCADE;
DROP TABLE IF EXISTS settings              CASCADE;

-- =============================================================
-- 2. CREATE TABLE
-- =============================================================

CREATE TABLE catalog_types (
  id         SERIAL PRIMARY KEY,
  slug       TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE TABLE categories (
  id              SERIAL PRIMARY KEY,
  catalog_type_id INT REFERENCES catalog_types(id),
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  sort_order      INT DEFAULT 0
);

CREATE TABLE menu_items (
  id          SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id),
  name        TEXT NOT NULL,
  price       INT NOT NULL,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- users использует tg_id BIGINT как PK — без SERIAL, без sequence
CREATE TABLE users (
  tg_id         BIGINT PRIMARY KEY,
  username      TEXT,
  first_name    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ
);

CREATE TABLE orders (
  id                SERIAL PRIMARY KEY,
  order_number      TEXT UNIQUE NOT NULL,
  user_tg_id        BIGINT REFERENCES users(tg_id),
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  address_text      TEXT,
  address_photo_url TEXT,
  comment           TEXT,
  items_json        JSONB NOT NULL,
  subtotal          INT NOT NULL,
  delivery_fee      INT NOT NULL DEFAULT 4000,
  total             INT NOT NULL,
  status            TEXT DEFAULT 'accepted',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_status_history (
  id         SERIAL PRIMARY KEY,
  order_id   INT REFERENCES orders(id),
  status     TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id           SERIAL PRIMARY KEY,
  order_id     INT REFERENCES orders(id),
  user_tg_id   BIGINT REFERENCES users(tg_id),
  rating       INT CHECK (rating BETWEEN 1 AND 5),
  requested_at TIMESTAMPTZ,
  reminded_at  TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE
);

-- =============================================================
-- 3. ТРИГГЕР auto-update updated_at
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- 4. SEED — начальные данные
-- =============================================================

-- Типы каталога
INSERT INTO catalog_types (slug, name, is_active, sort_order) VALUES
  ('retort', 'Реторт',        TRUE,  1),
  ('frozen', 'Заморозка',     FALSE, 2),
  ('semi',   'Полуфабрикаты', FALSE, 3);

-- Категории: 3 типа × 3 категории = 9 строк
INSERT INTO categories (catalog_type_id, slug, name, sort_order) VALUES
  -- Реторт (id=1)
  (1, 'first',  'Первые блюда', 1),
  (1, 'second', 'Вторые блюда', 2),
  (1, 'sauces', 'Подливы',      3),
  -- Заморозка (id=2)
  (2, 'first',  'Первые блюда', 1),
  (2, 'second', 'Вторые блюда', 2),
  (2, 'sauces', 'Подливы',      3),
  -- Полуфабрикаты (id=3)
  (3, 'first',  'Первые блюда', 1),
  (3, 'second', 'Вторые блюда', 2),
  (3, 'sauces', 'Подливы',      3);

-- Активные блюда — Первые блюда Реторт (category_id = 1)
INSERT INTO menu_items (category_id, name, price, image_url, is_active, sort_order) VALUES
  (1, 'Борщ',         10000, 'borsh.jpeg',         TRUE, 1),
  (1, 'Солянка',      10000, 'solyanka.jpeg',       TRUE, 2),
  (1, 'Харчо',        10000, 'harcho.jpeg',         TRUE, 3),
  (1, 'Шурпа',        10000, 'shurpa.jpeg',         TRUE, 4),
  (1, 'Пуктяй',        8000, 'pyktyai.jpeg',        TRUE, 5),
  (1, 'Сиряктямури',   8000, 'siryaktyamuri.jpeg',  TRUE, 6);

-- Активные блюда — Вторые блюда Реторт (category_id = 2)
INSERT INTO menu_items (category_id, name, price, image_url, is_active, sort_order) VALUES
  (2, 'Бефстроганов',              10000, 'befstroganov.jpeg',         TRUE, 1),
  (2, 'Плов домашний',             10000, 'plov.jpeg',                 TRUE, 2),
  (2, 'Гуляш из говядины',         10000, 'gylyash.jpeg',              TRUE, 3),
  (2, 'Говядина с овощами',        10000, 'govyadina_s_ovoshami.jpeg', TRUE, 4),
  (2, 'Тефтели в томатном соусе',  10000, 'tefteli.jpeg',              TRUE, 5);

-- Неактивные — Первые блюда (category_id = 1)
INSERT INTO menu_items (category_id, name, price, image_url, is_active, sort_order) VALUES
  (1, 'Рассольник',    0, NULL, FALSE, 7),
  (1, 'Гороховый суп', 0, NULL, FALSE, 8),
  (1, 'Чучвара',       0, NULL, FALSE, 9);

-- Неактивные — Вторые блюда (category_id = 2)
INSERT INTO menu_items (category_id, name, price, image_url, is_active, sort_order) VALUES
  (2, 'Голубцы',             0, NULL, FALSE,  6),
  (2, 'Фаршированный перец', 0, NULL, FALSE,  7),
  (2, 'Манты',               0, NULL, FALSE,  8),
  (2, 'Бузы',                0, NULL, FALSE,  9),
  (2, 'Хинкали',             0, NULL, FALSE, 10),
  (2, 'Печень',              0, NULL, FALSE, 11);

-- Неактивные — Подливы (category_id = 3)
INSERT INTO menu_items (category_id, name, price, image_url, is_active, sort_order) VALUES
  (3, 'Подлива для лагмана', 0, NULL, FALSE, 1),
  (3, 'Подлива говядина',    0, NULL, FALSE, 2),
  (3, 'Подлива курица',      0, NULL, FALSE, 3),
  (3, 'Подлива свинина',     0, NULL, FALSE, 4);

-- Настройки
INSERT INTO settings (key, value) VALUES
  ('delivery_phone',    '+82 10 8361 6165'),
  ('bank_name',         'Kookmin Bank'),
  ('bank_account',      '784500100505790'),
  ('bank_holder',       'TSOI ANTON'),
  ('free_delivery_min', '50000'),
  ('delivery_fee',      '4000');

-- =============================================================
-- 5. RLS — включить
-- =============================================================

ALTER TABLE catalog_types        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_tokens         ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 6. RLS ПОЛИТИКИ
-- =============================================================

-- catalog_types
CREATE POLICY "anon_select_catalog_types"
  ON catalog_types FOR SELECT TO anon
  USING (is_active = TRUE);

-- categories
CREATE POLICY "anon_select_categories"
  ON categories FOR SELECT TO anon
  USING (TRUE);

-- menu_items
CREATE POLICY "anon_select_menu_items"
  ON menu_items FOR SELECT TO anon
  USING (is_active = TRUE);

-- settings
CREATE POLICY "anon_select_settings"
  ON settings FOR SELECT TO anon
  USING (TRUE);

-- orders: anon может создавать заказы
CREATE POLICY "anon_insert_orders"
  ON orders FOR INSERT TO anon
  WITH CHECK (TRUE);

-- users: anon вставляет и обновляет только свою строку по tg_id
CREATE POLICY "anon_insert_users"
  ON users FOR INSERT TO anon
  WITH CHECK (TRUE);

CREATE POLICY "anon_select_users"
  ON users FOR SELECT TO anon
  USING (TRUE);

CREATE POLICY "anon_update_users"
  ON users FOR UPDATE TO anon
  USING (TRUE)
  WITH CHECK (TRUE);

-- service_role обходит RLS автоматически в Supabase,
-- но явные политики страхуют при изменении настроек проекта
CREATE POLICY "service_role_all_orders"
  ON orders FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_users"
  ON users FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_reviews"
  ON reviews FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_order_status_history"
  ON order_status_history FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_admin_tokens"
  ON admin_tokens FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_menu_items"
  ON menu_items FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_settings"
  ON settings FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_catalog_types"
  ON catalog_types FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_all_categories"
  ON categories FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

-- =============================================================
-- 7. GRANT
-- =============================================================

-- anon: чтение каталога, создание заказов и пользователей
GRANT SELECT         ON catalog_types  TO anon;
GRANT SELECT         ON categories     TO anon;
GRANT SELECT         ON menu_items     TO anon;
GRANT SELECT         ON settings       TO anon;
GRANT SELECT, INSERT ON orders         TO anon;
GRANT SELECT, INSERT, UPDATE ON users  TO anon;

-- sequences через bulk grant — без указания конкретных имён
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- service_role: полный доступ
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
