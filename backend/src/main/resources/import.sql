-- SQL schema generated from Quarkus entities

CREATE TABLE sectors (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE bricks (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector_id UUID,
    FOREIGN KEY (sector_id) REFERENCES sectors(id)
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    sector_id UUID,
    supervisor_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (sector_id) REFERENCES sectors(id),
    FOREIGN KEY (supervisor_id) REFERENCES profiles(id)
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    therapeutic_class VARCHAR(64)
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    brick_id UUID,
    FOREIGN KEY (brick_id) REFERENCES bricks(id)
);

CREATE TABLE sales_plans (
    id UUID PRIMARY KEY,
    delegate_id UUID,
    product_id UUID,
    brick_id UUID,
    FOREIGN KEY (delegate_id) REFERENCES profiles(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (brick_id) REFERENCES bricks(id)
);

CREATE TABLE sales (
    id UUID PRIMARY KEY,
    year INT NOT NULL,
    sales_plan_id UUID,
    FOREIGN KEY (sales_plan_id) REFERENCES sales_plans(id)
);

CREATE TABLE visits (
    id UUID PRIMARY KEY,
    visit_date DATE NOT NULL,
    delegate_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    product_id UUID,
    brick_id UUID,
    status VARCHAR(32),
    notes VARCHAR(1000),
    feedback VARCHAR(1000),
    return_index INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (delegate_id) REFERENCES profiles(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (brick_id) REFERENCES bricks(id)
);

CREATE TABLE action_plans (
    id UUID PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(1000),
    type VARCHAR(32) NOT NULL,
    created_by UUID NOT NULL,
    supervisor_status VARCHAR(32) NOT NULL,
    sales_director_status VARCHAR(32) NOT NULL,
    marketing_manager_status VARCHAR(32) NOT NULL,
    is_executed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- Element collections for ActionPlan
CREATE TABLE action_plan_targeted_doctors (
    action_plan_id UUID,
    doctor_id UUID,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
CREATE TABLE action_plan_targeted_bricks (
    action_plan_id UUID,
    brick_id UUID,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id),
    FOREIGN KEY (brick_id) REFERENCES bricks(id)
);
CREATE TABLE action_plan_targeted_delegates (
    action_plan_id UUID,
    delegate_id UUID,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id),
    FOREIGN KEY (delegate_id) REFERENCES profiles(id)
);
CREATE TABLE action_plan_targeted_supervisors (
    action_plan_id UUID,
    supervisor_id UUID,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id),
    FOREIGN KEY (supervisor_id) REFERENCES profiles(id)
);
CREATE TABLE action_plan_targeted_sales_directors (
    action_plan_id UUID,
    sales_director_id UUID,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id),
    FOREIGN KEY (sales_director_id) REFERENCES profiles(id)
);
CREATE TABLE action_plan_targeted_products (
    action_plan_id UUID,
    product_id UUID,
    FOREIGN KEY (action_plan_id) REFERENCES action_plans(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
