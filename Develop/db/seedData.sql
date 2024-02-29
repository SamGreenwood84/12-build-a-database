USE employee_db;

-- Insert data into the department table
INSERT INTO department (id, department_name) VALUES
(1, 'Sales'),
(2, 'Information Technology'),
(3, 'Finance'),
(4, 'Human Resources'),
(5, 'Supply Chain Management'),
(6, 'Security'),
(7, 'Marketing');

-- Insert data into the role table
INSERT INTO role (id, title, salary, department_id) VALUES
(1, 'Sales Manager', 150000, 1),
(2, 'Sales Lead', 100000, 1),
(3, 'Cyber Security Manager', 100000, 2),
(4, 'Account Analyst', 50000, 2),
(5, 'Finance Manager', 200000, 3),
(6, 'Accountant', 60000, 3),
(7, 'HR Manager', 80000, 4),
(8, 'Employee Support', 60000, 4),
(9, 'Strategic Sourcing Manager', 120000, 5),
(10, 'Account Rep', 70000, 5),
(11, 'Security Manager', 60000, 6),
(12, 'Guard', 40000, 6),
(13, 'Marketing Manager', 90000, 7);

-- Insert data into the managers table
INSERT INTO managers (id, manager_name, department_name, role_id) VALUES
(1, 'Chance TheRapper', 'Sales', 1),
(2, 'Joe Biden', 'Information Technology', 3),
(3, 'Bart Simpson', 'Finance', 5),
(4, 'Snow White', 'Human Resources', 7),
(5, 'Busta Rhymes', 'Supply Chain Management', 9),
(6, 'Stewie Griffin', 'Security', 11);

-- Insert data into the employee table
INSERT INTO employee (id, first_name, last_name, title, salary, manager_name) VALUES
(1, 'Eddie', 'Cheddar', 'Sales Lead', 100000, 'Chance TheRapper'),
(2, 'Crash', 'Bandicoot', 'Account Analyst', 50000, 'Joe Biden'),
(2, 'Kevin', 'Malone', 'Accountant', 'Bart Simpson'),
(3, 'Mary', 'Jane', 'Employee Support', 60000, 'Snow White'),
(4, 'Buffy', 'Thevampireslayer', 'Account Rep', 70000, 'Busta Rhymes'),
(5, 'Hewho', 'Shallnotbenamed', 'Guard', 40000, 'Stewie Griffin');
