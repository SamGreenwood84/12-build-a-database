const inquirer = require("inquirer");

console.log(".............................................");
console.log("Welcome to Your Employee Database!");
console.log("Enter employee details to add to the database.");
console.log(".............................................");

const departmentQuestions = [
  {
    type: "input",
    name: "departmentName",
    message: "Enter the department name:",
    validate: function (input) {
      return input.trim() !== "" || "Please enter a valid department name.";
    },
  },
];

const roleQuestions = [
  {
    type: "input",
    name: "roleName",
    message: "Enter the role name:",
    validate: function (input) {
      return input.trim() !== "" || "Please enter a valid role name.";
    },
  },
];

const managerQuestions = [
  {
    type: "input",
    name: "managerName",
    message: "Enter the Manager name:",
    validate: function (input) {
      return input.trim() !== "" || "Please enter a valid manager name.";
    },
  },
];

const employeeQuestions = [
  {
    type: "input",
    name: "firstName",
    message: "Enter the employee's first name:",
    validate: function (input) {
      return input.trim() !== "" || "Please enter a valid first name.";
    },
  },
  {
    type: "input",
    name: "lastName",
    message: "Enter the employee's last name:",
    validate: function (input) {
      return input.trim() !== "" || "Please enter a valid last name.";
    },
  },
  {
    type: "input",
    name: "roleId",
    message: "Enter the employee's role ID:",
    validate: function (input) {
      return /^\d+$/.test(input) || "Please enter a valid role ID (numeric).";
    },
  },
  {
    type: "input",
    name: "managerId",
    message: "Enter the employee's manager ID (optional, press Enter to skip):",
    validate: function (input) {
      return input === "" || /^\d+$/.test(input) || "Please enter a valid manager ID (numeric) or leave it empty.";
    },
  },
];

function insertDepartment(departmentName) {
  // Logic to insert department data into the database
  console.log(`Inserting department: ${departmentName}`);
}

function insertRole(roleName) {
  // Logic to insert role data into the database
  console.log(`Inserting role: ${roleName}`);
}

function insertManager(managerName) {
  // Logic to insert manager data into the database
  console.log(`Inserting manager: ${managerName}`);
}

function insertEmployee(employeeData) {
  // Logic to insert employee data into the database
  console.log(`Inserting employee: ${JSON.stringify(employeeData)}`);
}

function startDepartmentInput() {
  inquirer.prompt(departmentQuestions).then(({ departmentName }) => {
    insertDepartment(departmentName);
    startRoleInput();
  });
}

function startRoleInput() {
  inquirer.prompt(roleQuestions).then(({ roleName }) => {
    insertRole(roleName);
    startManagerInput();
  });
}

function startManagerInput() {
  inquirer.prompt(managerQuestions).then(({ managerName }) => {
    insertManager(managerName);
    startEmployeeInput();
  });
}

function startEmployeeInput() {
  inquirer.prompt(employeeQuestions).then((employeeData) => {
    insertEmployee(employeeData);
    // Add any additional logic or options here
  });
}

startDepartmentInput();
