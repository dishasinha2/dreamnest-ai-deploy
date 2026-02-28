CREATE DATABASE IF NOT EXISTS dreamnest;
USE dreamnest;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS (progress will be computed from linked tables)
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  room_type VARCHAR(60) NOT NULL,         -- living_room, bedroom, etc
  budget_inr INT NOT NULL,
  style_tags JSON NOT NULL,                -- ["modern","warm","minimal"]
  location_city VARCHAR(90) NOT NULL,
  area_sqft INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- simple progress signals
CREATE TABLE IF NOT EXISTS project_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  event_type VARCHAR(60) NOT NULL,  -- created, requirements_added, shortlist_added, vendor_viewed
  meta JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- REQUIREMENTS
CREATE TABLE IF NOT EXISTS requirements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  notes TEXT,
  must_haves JSON,                         -- ["sofa","coffee table"]
  colors JSON,                             -- ["walnut","beige"]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Vendor applications (self-signup flow)
CREATE TABLE IF NOT EXISTS vendor_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  city VARCHAR(90) NOT NULL,
  service_types JSON NOT NULL,
  phone VARCHAR(40),
  whatsapp VARCHAR(40),
  website TEXT,
  about TEXT,
  years_exp INT DEFAULT 0,
  portfolio_links JSON,
  status VARCHAR(20) DEFAULT 'pending',   -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VENDORS (real local vendors)
CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  city VARCHAR(90) NOT NULL,
  service_types JSON NOT NULL,             -- ["carpentry","interior","modular_kitchen"]
  phone VARCHAR(40),
  whatsapp VARCHAR(40),
  website TEXT,
  about TEXT,
  years_exp INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor portfolio (previous work)
CREATE TABLE IF NOT EXISTS vendor_portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  image_url TEXT NOT NULL,                 -- store hosted images or cloud links
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Reviews / ratings
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  reviewer_name VARCHAR(120),
  rating TINYINT NOT NULL,                 -- 1..5
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- PRODUCTS (real furniture items, with real outbound URLs)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  brand VARCHAR(120),
  category VARCHAR(80) NOT NULL,           -- sofa, bed, lamp...
  room_type VARCHAR(60) NOT NULL,          -- living_room, bedroom...
  style VARCHAR(80) NOT NULL,              -- modern, boho...
  price_inr INT,
  product_url TEXT NOT NULL,               -- e-commerce link
  image_url TEXT,
  description TEXT,
  tags JSON,
  source VARCHAR(50) NOT NULL DEFAULT 'ecommerce',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_room_style_price (room_type, style, price_inr)
);

-- Shortlist (so progress & user workflow becomes real)
CREATE TABLE IF NOT EXISTS shortlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shortlist (project_id, product_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Click tracking (analytics + affiliate)
CREATE TABLE IF NOT EXISTS click_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  ref VARCHAR(60) DEFAULT 'recommendations',
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- FEEDBACK
CREATE TABLE IF NOT EXISTS feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(120),
  email VARCHAR(190),
  rating TINYINT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
