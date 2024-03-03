// databaseActions.js

const { connectionPool } = require("../Config/connection");
const inquirer = require("inquirer");
async function isNewRole() {
  const { isNewRole } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isNewRole",
      message: "Is this a new role?",
    },
  ]);
  return isNewRole;
}

async function insertDepartment(departmentName) {
  const query = "INSERT INTO departments (department_name) VALUES (?)";

  try {
    const [results] = await connectionPool.query(query, [departmentName]);
    console.log(`Department added successfully with ID: ${results.insertId}`);
  } catch (error) {
    console.error(`Error inserting department: ${error.message}`);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

async function insertRole(roleTitle, roleSalary, department_id) {
  const query =
    "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)";

  try {
    const [results] = await connectionPool.query(query, [
      roleTitle,
      roleSalary,
      department_id
    ]);
    console.log(`Role added successfully with ID: ${results.insertId}`);
    return results.insertId;
  } catch (error) {
    console.error(`Error inserting role: ${error.message}`);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

async function insertEmployee(firstName, lastName, roleId, managerId) {
  const query =
    "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";

  try {
    const [results] = await connectionPool.query(query, [
      firstName,
      lastName,
      roleId,
      managerId,
    ]);
    console.log(`Employee added successfully with ID: ${results.insertId}`);
    return results.insertId;
  } catch (error) {
    console.error(`Error inserting employee: ${error.message}`);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

async function insertManager(firstName, lastName, departmentName, roleId) {
  const query =
    "INSERT INTO managers (first_name, last_name, department_name, role_id) VALUES (?, ?, ?, ?)";

  try {
    const [results] = await connectionPool.query(query, [
      firstName,
      lastName,
      departmentName,
      roleId,
    ]);
    console.log(`Manager added successfully with ID: ${results.insertId}`);
  } catch (error) {
    console.error(`Error inserting manager: ${error.message}`);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

module.exports = {
  isNewRole,
  insertDepartment,
  insertRole,
  insertEmployee,
  insertManager,
};
