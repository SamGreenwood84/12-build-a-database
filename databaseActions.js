// databaseActions.js

const connectionPool = require("./dbConnection");

async function isNewRole() {
  // ... (unchanged)
}

async function insertDepartment(departmentName) {
  // ... (unchanged)
}

async function insertRole(roleTitle, roleSalary, department_id) {
  // ... (unchanged)
}

async function insertEmployee(firstName, lastName, roleId, managerId) {
  // ... (unchanged)
}

async function insertManager(firstName, lastName, departmentName, roleId) {
  // ... (unchanged)
}

module.exports = {
  isNewRole,
  insertDepartment,
  insertRole,
  insertEmployee,
  insertManager,
};
