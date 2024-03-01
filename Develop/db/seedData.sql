USE employee_db;

-- Insert data into the department table
INSERT INTO departments (department_name) VALUES
('Sales'),
('Information Technology'),
('Finance'),
('Human Resources'),
('Supply Chain Management'),
('Security'),
('Marketing');

-- Insert data into the role table
INSERT INTO roles (title, salary, department_id) VALUES
('Sales Manager', 150000, 1),
('Sales Lead', 100000, 1),
('Cyber Security Manager', 100000, 2),
('Account Analyst', 50000, 2),
('Finance Manager', 120000, 3),
('Accountant', 60000, 3),
('HR Manager', 80000, 4),
('Employee Support', 60000, 4),
('Strategic Sourcing Manager', 120000, 5),
('Account Rep', 70000, 5),
('Security Manager', 60000, 6),
('Guard', 40000, 6),
('Marketing Manager', 90000, 7);

-- Insert data into the managers table
INSERT INTO managers (first_name, last_name, department_name, role_id) VALUES
('Chance', 'TheRapper', 'Sales', 1),
('Joe', 'Biden', 'Information Technology', 3),
('Bart', 'Simpson', 'Finance', 5),
('Snow', 'White', 'Human Resources', 7),
('Busta', 'Rhymes', 'Supply Chain Management', 9),
('Stewie', 'Griffin', 'Security', 11);

-- Insert data into the employee table
INSERT INTO employees (first_name, last_name, title, salary, manager_id) VALUES
('Eddie', 'Cheddar', 'Sales Lead', 100000, 1),
('Crash', 'Bandicoot', 'Account Analyst', 50000, 2),
('Kevin', 'Malone', 'Accountant', 60000, 3),
('Mary', 'Jane', 'Employee Support', 60000, 4),
('Buffy', 'Thevampireslayer', 'Account Rep', 70000, 5),
('Hewho', 'Shallnotbenamed', 'Guard', 40000, 6);