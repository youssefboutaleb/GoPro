-- Create sectors table
CREATE TABLE sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    UNIQUE(name)
);

-- Create bricks table
CREATE TABLE bricks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sector_id UUID,
    CONSTRAINT fk_bricks_sector FOREIGN KEY (sector_id) REFERENCES sectors(id)
);

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'sales_director', 'supervisor', 'delegate')),
    sector_id UUID,
    supervisor_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_sector FOREIGN KEY (sector_id) REFERENCES sectors(id),
    CONSTRAINT fk_profiles_supervisor FOREIGN KEY (supervisor_id) REFERENCES profiles(id)
);

-- Create doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    brick_id UUID,
    CONSTRAINT fk_doctors_brick FOREIGN KEY (brick_id) REFERENCES bricks(id)
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    therapeutic_class VARCHAR(50),
    UNIQUE(name)
);

-- Create sales_plans table
CREATE TABLE sales_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegate_id UUID,
    product_id UUID,
    brick_id UUID,
    CONSTRAINT fk_sales_plans_delegate FOREIGN KEY (delegate_id) REFERENCES profiles(id),
    CONSTRAINT fk_sales_plans_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_sales_plans_brick FOREIGN KEY (brick_id) REFERENCES bricks(id)
);

-- Create sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    targets INTEGER[],
    achievements INTEGER[],
    sales_plan_id UUID,
    CONSTRAINT fk_sales_sales_plan FOREIGN KEY (sales_plan_id) REFERENCES sales_plans(id)
);

-- Create action_plans table
CREATE TABLE action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('visit', 'meeting', 'training', 'event', 'promotion', 'product_launch', 'market_research', 'competitive_analysis', 'strategy_planning', 'budget_planning', 'team_building', 'performance_review', 'other')),
    created_by UUID NOT NULL,
    supervisor_status VARCHAR(50) DEFAULT 'pending' CHECK (supervisor_status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
    sales_director_status VARCHAR(50) DEFAULT 'pending' CHECK (sales_director_status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
    marketing_manager_status VARCHAR(50) DEFAULT 'pending' CHECK (marketing_manager_status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
    is_executed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_plans_created_by FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- Create action plan targeted entities tables
CREATE TABLE action_plan_targeted_doctors (
    action_plan_id UUID,
    doctor_id UUID,
    PRIMARY KEY (action_plan_id, doctor_id),
    CONSTRAINT fk_targeted_doctors_action_plan FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_targeted_doctors_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE action_plan_targeted_bricks (
    action_plan_id UUID,
    brick_id UUID,
    PRIMARY KEY (action_plan_id, brick_id),
    CONSTRAINT fk_targeted_bricks_action_plan FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_targeted_bricks_brick FOREIGN KEY (brick_id) REFERENCES bricks(id)
);

CREATE TABLE action_plan_targeted_delegates (
    action_plan_id UUID,
    delegate_id UUID,
    PRIMARY KEY (action_plan_id, delegate_id),
    CONSTRAINT fk_targeted_delegates_action_plan FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_targeted_delegates_delegate FOREIGN KEY (delegate_id) REFERENCES profiles(id)
);

CREATE TABLE action_plan_targeted_supervisors (
    action_plan_id UUID,
    supervisor_id UUID,
    PRIMARY KEY (action_plan_id, supervisor_id),
    CONSTRAINT fk_targeted_supervisors_action_plan FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_targeted_supervisors_supervisor FOREIGN KEY (supervisor_id) REFERENCES profiles(id)
);

CREATE TABLE action_plan_targeted_sales_directors (
    action_plan_id UUID,
    sales_director_id UUID,
    PRIMARY KEY (action_plan_id, sales_director_id),
    CONSTRAINT fk_targeted_sales_directors_action_plan FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_targeted_sales_directors_sales_director FOREIGN KEY (sales_director_id) REFERENCES profiles(id)
);

CREATE TABLE action_plan_targeted_products (
    action_plan_id UUID,
    product_id UUID,
    PRIMARY KEY (action_plan_id, product_id),
    CONSTRAINT fk_targeted_products_action_plan FOREIGN KEY (action_plan_id) REFERENCES action_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_targeted_products_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create visits table
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_date DATE NOT NULL,
    delegate_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    product_id UUID,
    brick_id UUID,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'postponed')),
    notes TEXT,
    feedback TEXT,
    return_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visits_delegate FOREIGN KEY (delegate_id) REFERENCES profiles(id),
    CONSTRAINT fk_visits_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_visits_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_visits_brick FOREIGN KEY (brick_id) REFERENCES bricks(id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_sector_id ON profiles(sector_id);
CREATE INDEX idx_profiles_supervisor_id ON profiles(supervisor_id);
CREATE INDEX idx_doctors_brick_id ON doctors(brick_id);
CREATE INDEX idx_visits_delegate_id ON visits(delegate_id);
CREATE INDEX idx_visits_doctor_id ON visits(doctor_id);
CREATE INDEX idx_visits_brick_id ON visits(brick_id);
CREATE INDEX idx_visits_product_id ON visits(product_id);
CREATE INDEX idx_visits_visit_date ON visits(visit_date);
CREATE INDEX idx_action_plans_created_by ON action_plans(created_by);
CREATE INDEX idx_action_plans_date ON action_plans(date);
CREATE INDEX idx_sales_plans_delegate_id ON sales_plans(delegate_id);
CREATE INDEX idx_sales_plans_product_id ON sales_plans(product_id);
CREATE INDEX idx_sales_plans_brick_id ON sales_plans(brick_id);