CREATE TABLE IF NOT EXISTS admin_order_messages (
  order_id    INT REFERENCES orders(id) ON DELETE CASCADE,
  admin_tg_id BIGINT NOT NULL,
  message_id  INT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (order_id, admin_tg_id)
);

ALTER TABLE admin_order_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_admin_order_messages"
  ON admin_order_messages;

CREATE POLICY "service_role_all_admin_order_messages"
  ON admin_order_messages FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);
