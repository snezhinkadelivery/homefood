-- Activity marker used to select recent users for admin broadcasts.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS users_last_seen_at_idx
  ON users (last_seen_at);
