-- Таблица промокодов
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INT NOT NULL DEFAULT 10,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Колонки в orders для промокода
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount INT NOT NULL DEFAULT 0;

-- RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- anon может читать активные коды (валидация в TMA)
CREATE POLICY "anon read active promo_codes"
ON promo_codes FOR SELECT TO anon
USING (is_active = TRUE);

-- Права
GRANT ALL ON promo_codes TO service_role;
GRANT USAGE, SELECT ON SEQUENCE promo_codes_id_seq TO service_role;
GRANT SELECT ON promo_codes TO anon;

-- Функция инкремента использований
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code_value TEXT)
RETURNS void AS $$
  UPDATE promo_codes
  SET used_count = used_count + 1
  WHERE code = promo_code_value;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_promo_usage TO anon;

-- Тестовый промокод
INSERT INTO promo_codes (code, discount_percent, is_active)
VALUES ('WELCOME10', 10, TRUE)
ON CONFLICT (code) DO NOTHING;
