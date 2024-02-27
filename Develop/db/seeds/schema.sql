--Schema for Employee Database Table

CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL
    department_id: INT
);

CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) UNIQUE NOT NULL,
    last_name VARCHAR(30) UNIQUE NOT NULL,
    role_id INT
    manager_id INT,
);

--Insert into query

/*
INSERT INTO department (name) VALUES
('Sales & Marketing'),
('Information Technology'),
('Research & Development'),
('Human Resources'),
('Supply Chain & Strategic Sourcing'),

INSERT INTO role (id, title, salary)
('manager', '150,000', '1'),
('manager', '100,000', '2'),
('manager', '65,000', '3'),
('manager', '80,000', '4'),
('manager', '120,000', '5');

INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES
('1', 'Chance', 'Therapper'),
('2', 'Joe', 'Biden'),
('3', 'Bart', 'Simpson'),
('4', 'Snow', 'White'),
('5', 'Busta', 'Rhymes');
