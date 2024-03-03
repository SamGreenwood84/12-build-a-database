// databaseFunctions.js

const inquirer = require("inquirer");
const {
  viewAllTables,
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  viewAllManagers,
  viewAllSalaries,
  startEmployeeInput,
  startManagerInput,
} = require("./database");

async function viewAllTables() {
  try {
    const [departmentRows] = await connectionPool.execute("SELECT * FROM departments");
    console.log("\nAll Departments:");
    console.table(departmentRows);

    const [roleRows] = await connectionPool.execute("SELECT * FROM roles");
    console.log("\nAll Roles:");
    console.table(roleRows);

    const [employeeRows] = await connectionPool.execute("SELECT * FROM employees");
    console.log("\nAll Employees:");
    console.table(employeeRows);

    const [managerRows] = await connectionPool.execute("SELECT * FROM managers");
    console.log("\nAll Managers:");
    console.table(managerRows);
  } catch (error) {
    console.error("Error viewing tables:", error);
  }
}

async function viewAllDepartments() {
  try {
    const [rows] = await connectionPool.execute("SELECT * FROM departments");
    console.log("\nAll Departments:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing departments:", error);
  }
}

async function viewAllRoles() {
  try {
    const [rows] = await connectionPool.execute("SELECT * FROM roles");
    console.log("\nAll Roles:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing roles:", error);
  }
}

async function viewAllEmployees() {
  try {
    const [rows] = await connectionPool.execute("SELECT * FROM employees");
    console.log("\nAll Employees:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing employees:", error);
  }
}

async function viewAllManagers() {
  try {
    const [rows] = await connectionPool.execute("SELECT * FROM managers");
    console.log("\nAll Managers:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing managers:", error);
  }
}

async function viewAllSalaries() {
  try {
    const [rows] = await connectionPool.execute(
      "SELECT first_name, last_name, salary FROM employees"
    );
    console.log("\nAll Salaries:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing salaries:", error);
  }
}

module.exports = {
  viewAllTables,
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  viewAllManagers,
  viewAllSalaries,
  startEmployeeInput,
  startManagerInput,
};
