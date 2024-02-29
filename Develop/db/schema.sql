--Schema for Employee Database Table

DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL,
    department_id INT
);

CREATE TABLE managers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manager_name VARCHAR(30) UNIQUE NOT NULL,
    department_name VARCHAR(30) UNIQUE NOT NULL,
    role_id INT
);

CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) UNIQUE NOT NULL,
    last_name VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL,
    manager_name VARCHAR(30) UNIQUE NOT NULL
);

--Insert into query

