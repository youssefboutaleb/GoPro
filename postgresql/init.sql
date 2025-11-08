-- Initialize database with default data

-- Insert default sectors
INSERT INTO sectors (name) VALUES 
    ('North Region'),
    ('South Region'),
    ('East Region'),
    ('West Region'),
    ('Central Region');

-- Insert default bricks
INSERT INTO bricks (name, sector_id) VALUES 
    ('Brick A', (SELECT id FROM sectors WHERE name = 'North Region' LIMIT 1)),
    ('Brick B', (SELECT id FROM sectors WHERE name = 'North Region' LIMIT 1)),
    ('Brick C', (SELECT id FROM sectors WHERE name = 'South Region' LIMIT 1)),
    ('Brick D', (SELECT id FROM sectors WHERE name = 'East Region' LIMIT 1)),
    ('Brick E', (SELECT id FROM sectors WHERE name = 'West Region' LIMIT 1));

-- Insert default admin user
INSERT INTO profiles (first_name, last_name, role, sector_id) VALUES 
    ('Admin', 'User', 'admin', NULL);

-- Insert default products
INSERT INTO products (name, therapeutic_class) VALUES 
    ('Product A', 'cardiology'),
    ('Product B', 'neurology'),
    ('Product C', 'gastroenterology'),
    ('Product D', 'pulmonology'),
    ('Product E', 'endocrinology');

-- Insert default doctors
INSERT INTO doctors (first_name, last_name, specialty, brick_id) VALUES 
    ('Dr. John', 'Smith', 'Cardiologist', (SELECT id FROM bricks WHERE name = 'Brick A' LIMIT 1)),
    ('Dr. Jane', 'Doe', 'Neurologist', (SELECT id FROM bricks WHERE name = 'Brick B' LIMIT 1)),
    ('Dr. Bob', 'Johnson', 'Gastroenterologist', (SELECT id FROM bricks WHERE name = 'Brick C' LIMIT 1)),
    ('Dr. Alice', 'Williams', 'Pulmonologist', (SELECT id FROM bricks WHERE name = 'Brick D' LIMIT 1)),
    ('Dr. Charlie', 'Brown', 'Endocrinologist', (SELECT id FROM bricks WHERE name = 'Brick E' LIMIT 1));