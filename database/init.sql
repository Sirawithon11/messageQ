CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  image_url   TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  customer_name  VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  total_price    DECIMAL(10,2) NOT NULL,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity   INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

-- Seed sample products
INSERT INTO products (name, description, price, stock, image_url) VALUES
  ('Wireless Headphones', 'High-quality over-ear headphones with noise cancellation', 89.99, 50, 'https://placehold.co/400x300?text=Headphones'),
  ('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches', 129.99, 30, 'https://placehold.co/400x300?text=Keyboard'),
  ('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', 49.99, 100, 'https://placehold.co/400x300?text=USB+Hub'),
  ('Webcam 1080p', 'Full HD webcam with built-in microphone', 69.99, 40, 'https://placehold.co/400x300?text=Webcam'),
  ('Mouse Pad XL', 'Extra-large desk mat with non-slip base', 24.99, 80, 'https://placehold.co/400x300?text=Mouse+Pad');
