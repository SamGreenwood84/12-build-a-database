-- Insert data into the department table

USE employee_db;

INSERT INTO department (id, name) VALUES
(1, 'Sales & Marketing'),
(2, 'Information Technology'),
(3, 'Finance'),
(4, 'Human Resources'),
(5, 'Supply Chain Management');

-- Insert data into the role table
INSERT INTO role (id, title, salary, department_id) VALUES
(1, 'Sales Lead', 100000, 1),
(2, 'Sales Manager', 150000, 1),
(3, 'Cyber Security Operations', 100000, 2),
(4, 'Account Analyst', 50000, 2),
(5, 'Finance VP', 200000, 3),
(6, 'Accountant', 60000, 3),
(7, 'Manager', 80000, 4),
(8, 'Employee Rep', 60000, 4),
(9, 'Strategic Sourcing Specialist', 120000, 5),
(10, 'Account Rep', 70000, 5);

-- Insert data into the managers table
INSERT INTO managers (id, first_name, last_name, department_id, role_id) VALUES
(1, 'Chance', 'The Rapper', 1, 2),
(2, 'Joe', 'Biden', 2, 3),
(3, 'Bart', 'Simpson', 3, 5),
(4, 'Snow', 'White', 4, 7),
(5, 'Busta', 'Rhymes', 5, 9);

-- Insert data into the employee table
INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES
(1, 'Chance', 'The Rapper', 2, NULL),
(2, 'Joe', 'Biden', 3, NULL),
(3, 'Bart', 'Simpson', 5, NULL),
(4, 'Snow', 'White', 7, NULL),
(5, 'Busta', 'Rhymes', 9, NULL),
(6, 'Eddie', 'Cheddar', 1, 1),
(7, 'Crash', 'Bandicoot', 4, 2),
(8, 'Mary', 'Jane', 8, 4),
(9, 'Buffy', 'The Vampire Slayer', 10, 5);
