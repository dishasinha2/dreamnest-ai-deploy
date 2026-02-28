CREATE DATABASE IF NOT EXISTS dreamnestai;
USE dreamnestai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    project_name VARCHAR(100) NOT NULL,
    property_type ENUM('flat', 'bungalow', 'villa', 'apartment') NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    style_preference ENUM('modern', 'traditional', 'luxury', 'minimal') NOT NULL,
    location VARCHAR(100) NOT NULL,
    area_sqft INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    room_type ENUM('living_room', 'bedroom', 'kitchen', 'bathroom', 'dining_room') NOT NULL,
    room_size INT NOT NULL,
    budget_allocation DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Furniture recommendations table
CREATE TABLE IF NOT EXISTS furniture_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type ENUM('furniture', 'decor', 'lighting') NOT NULL,
    style ENUM('modern', 'traditional', 'luxury', 'minimal') NOT NULL,
    price_range DECIMAL(8,2) NOT NULL,
    purchase_link VARCHAR(500),
    image_url VARCHAR(500)
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    service_type ENUM('carpenter', 'electrician', 'plumber', 'painter', 'interior_designer') NOT NULL,
    location VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15),
    rating DECIMAL(2,1) DEFAULT 0.0,
    experience_years INT DEFAULT 0
);

-- Insert sample furniture data
INSERT INTO furniture_recommendations (room_type, item_name, item_type, style, price_range, purchase_link, image_url) VALUES
('living_room', 'Modern Sofa Set', 'furniture', 'modern', 25000.00, 'https://example.com/sofa1', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7'),
('bedroom', 'King Size Bed', 'furniture', 'luxury', 45000.00, 'https://example.com/bed1', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
('kitchen', 'Modular Kitchen Cabinet', 'furniture', 'modern', 80000.00, 'https://example.com/kitchen1', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'),
('living_room', 'Coffee Table', 'furniture', 'minimal', 8000.00, 'https://example.com/table1', 'https://images.unsplash.com/photo-1555041469-586c6bc5d4e3'),
('bedroom', 'Wardrobe', 'furniture', 'traditional', 30000.00, 'https://example.com/wardrobe1', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7');

-- Insert sample vendors
INSERT INTO vendors (name, service_type, location, contact_number, rating, experience_years) VALUES
('Rajesh Carpentry', 'carpenter', 'Delhi', '9876543210', 4.5, 8),
('Sharma Electricians', 'electrician', 'Mumbai', '9876543211', 4.2, 5),
('Perfect Painters', 'painter', 'Bangalore', '9876543212', 4.7, 10),
('Quick Plumbers', 'plumber', 'Delhi', '9876543213', 4.0, 6),
('Design Hub Interiors', 'interior_designer', 'Mumbai', '9876543214', 4.8, 12);
// Add this to your furniture recommendations in schema.sql or update existing ones:
INSERT INTO furniture_recommendations (room_type, item_name, item_type, style, price_range, purchase_link, image_url) VALUES
('living_room', 'Modern L-Shaped Sofa', 'furniture', 'modern', 45000.00, 'https://www.pepperfry.com/l-shaped-sofas.html', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7'),
('bedroom', 'King Size Storage Bed', 'furniture', 'modern', 35000.00, 'https://www.urbanladder.com/beds', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
('kitchen', 'Modular Kitchen Cabinet', 'furniture', 'modern', 80000.00, 'https://www.livspace.com/in/modular-kitchens', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'),
('living_room', 'Glass Center Table', 'furniture', 'minimal', 12000.00, 'https://www.amazon.in/center-tables/s?k=center+tables', 'https://images.unsplash.com/photo-1555041469-586c6bc5d4e3');

// Update vendors with real contacts:
INSERT INTO vendors (name, service_type, location, contact_number, rating, experience_years) VALUES
('HomeCraft Carpentry', 'carpenter', 'Delhi', '+91-9876543210', 4.5, 8),
('SafeWire Electricians', 'electrician', 'Delhi', '+91-9876543211', 4.3, 6),
('ColorSplash Painters', 'painter', 'Delhi', '+91-9876543212', 4.7, 10),
('QuickFix Plumbers', 'plumber', 'Delhi', '+91-9876543213', 4.2, 5);

CREATE DATABASE IF NOT EXISTS dreamnestai;
USE dreamnestai;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  project_name VARCHAR(100) NOT NULL,
  property_type ENUM('flat','bungalow','villa','apartment') NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  style_preference ENUM('modern','traditional','luxury','minimal') NOT NULL,
  location VARCHAR(100) NOT NULL,
  area_sqft INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  room_type ENUM('living_room','bedroom','kitchen','bathroom','dining_room') NOT NULL,
  room_size INT NOT NULL,
  budget_allocation DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS furniture_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type VARCHAR(50) NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  item_type ENUM('furniture','decor','lighting') NOT NULL,
  style ENUM('modern','traditional','luxury','minimal') NOT NULL,
  price_range DECIMAL(10,2) NOT NULL,
  purchase_link VARCHAR(600),
  image_url VARCHAR(600)
);

CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  service_type ENUM('carpenter','electrician','plumber','painter','interior_designer') NOT NULL,
  location VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20),
  rating DECIMAL(2,1) DEFAULT 0.0,
  experience_years INT DEFAULT 0
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_furniture_lookup ON furniture_recommendations (room_type, style, price_range);
CREATE INDEX IF NOT EXISTS idx_vendors_lookup ON vendors (location, service_type, rating);

-- Seed furniture (real Indian e-commerce links)
INSERT INTO furniture_recommendations (room_type,item_name,item_type,style,price_range,purchase_link,image_url) VALUES
('living_room','Modern L-Shaped Sofa','furniture','modern',45000.00,'https://www.pepperfry.com/l-shaped-sofas.html','https://images.unsplash.com/photo-1586023492125-27b2c045efd7'),
('living_room','Glass Center Table','furniture','minimal',12000.00,'https://www.amazon.in/s?k=center+tables+glass','https://images.unsplash.com/photo-1555041469-586c6bc5d4e3'),
('living_room','Floor Lamp Matte','lighting','modern',6500.00,'https://www.ikea.com/in/en/cat/floor-lamps-20516/','https://images.unsplash.com/photo-1519710164239-da123dc03ef4'),
('bedroom','King Size Storage Bed','furniture','modern',35000.00,'https://www.urbanladder.com/beds','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
('bedroom','Wardrobe 3-Door','furniture','traditional',30000.00,'https://www.pepperfry.com/wardrobes.html','https://images.unsplash.com/photo-1582582429416-3161f2b7b6b3'),
('kitchen','Modular Kitchen Cabinet','furniture','modern',80000.00,'https://www.livspace.com/in/modular-kitchens','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'),
('dining_room','6-Seater Dining Set','furniture','luxury',52000.00,'https://www.pepperfry.com/dining-sets.html','https://images.unsplash.com/photo-1519710164239-da123dc03ef4'),
('bathroom','LED Mirror 24"','decor','modern',7000.00,'https://www.amazon.in/s?k=led+bathroom+mirror','https://images.unsplash.com/photo-1582582429416-3161f2b7b6b3');

-- Seed vendors (sample; edit locations as needed)
INSERT INTO vendors (name,service_type,location,contact_number,rating,experience_years) VALUES
('HomeCraft Carpentry','carpenter','Delhi','+91-9876543210',4.6,8),
('SafeWire Electricians','electrician','Delhi','+91-9876543211',4.3,6),
('ColorSplash Painters','painter','Delhi','+91-9876543212',4.7,10),
('QuickFix Plumbers','plumber','Delhi','+91-9876543213',4.2,5),
('Design Hub Interiors','interior_designer','Mumbai','+91-9876543214',4.8,12),
('Pro Carpentry Works','carpenter','Bengaluru','+91-9888888888',4.5,9),
('LightRight Electric Co','electrician','Mumbai','+91-9777777777',4.4,7),
('Perfect Plumb','plumber','Bengaluru','+91-9666666666',4.1,6);
