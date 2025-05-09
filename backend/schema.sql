-- Cafes table
CREATE TABLE cafes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  usdc_rate NUMERIC NOT NULL, -- e.g., 4 USDC per hour
  interval_minutes INTEGER NOT NULL -- e.g., 15, 30, 60
);

-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  cafe_id INTEGER NOT NULL,
  minutes_paid INTEGER NOT NULL,
  usdc_paid NUMERIC NOT NULL,
  commission_paid NUMERIC NOT NULL,
  anticoins_earned INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
