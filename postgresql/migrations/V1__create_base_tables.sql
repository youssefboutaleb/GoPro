-- Create regions table
CREATE TABLE regions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bricks table
CREATE TABLE bricks (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_id VARCHAR(255) REFERENCES regions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE profiles (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50),
    supervisor_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES profiles(id)
);

-- Create doctors table
CREATE TABLE doctors (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    brick_id VARCHAR(255) REFERENCES bricks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create visit_plans table
CREATE TABLE visit_plans (
    id VARCHAR(255) PRIMARY KEY,
    delegate_id VARCHAR(255) REFERENCES profiles(id),
    doctor_id VARCHAR(255) REFERENCES doctors(id),
    visit_frequency INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create visits table
CREATE TABLE visits (
    id VARCHAR(255) PRIMARY KEY,
    visit_plan_id VARCHAR(255) REFERENCES visit_plans(id),
    visit_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sales_plans table
CREATE TABLE sales_plans (
    id VARCHAR(255) PRIMARY KEY,
    delegate_id VARCHAR(255) REFERENCES profiles(id),
    month INTEGER,
    year INTEGER,
    target_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create action_plan_categories table
CREATE TABLE action_plan_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create action_plans table
CREATE TABLE action_plans (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) REFERENCES profiles(id),
    supervisor_status VARCHAR(50) DEFAULT 'Pending',
    sales_director_status VARCHAR(50) DEFAULT 'Pending',
    marketing_manager_status VARCHAR(50) DEFAULT 'Pending',
    category_id VARCHAR(255) REFERENCES action_plan_categories(id),
    due_date DATE,
    targeted_delegates VARCHAR(255)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE sales (
    id VARCHAR(255) PRIMARY KEY,
    delegate_id VARCHAR(255) REFERENCES profiles(id),
    product_id VARCHAR(255) REFERENCES products(id),
    quantity INTEGER,
    sale_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);