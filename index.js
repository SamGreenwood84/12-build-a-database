const inquirer = require("inquirer");
const mysql = require("mysql2/promise");
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const connectionPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1111',
  database: 'employee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function displaySuccessMessage() {
  try {
    const figletText = fs.readFileSync(path.join(__dirname, 'Success.txt'), 'utf8');
    execSync(`figlet Success! ${figletText}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error displaying Figlet message:', error.message);
  }
}

displaySuccessMessage();

console.log(".............................................");
console.log("Welcome to Your Employee Database!");
console.log("Enter employee details to add to the database.");

const commonEmployeeQuestions = [
  {
    type: "input",
    name: "firstName",
    message: "Enter their first name:",
    validate: function (input) {
      return input.trim() !== "" || "Invalid entry";
    },
  },
  {
    type: "input",
    name: "lastName",
    message: "Enter their last name:",
    validate: function (input) {
      return input.trim() !== "" || "Invalid entry";
    },
  },
];

const employeeQuestions = [
  ...commonEmployeeQuestions,
  {
    type: "input",
    name: "roleId",
    message: "Enter their role ID:",
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

const managerQuestions = [
  ...commonEmployeeQuestions,
  {
    type: "input",
    name: "departmentName",
    message: "Enter the manager's department name:",
    validate: function (input) {
      return input.trim() !== "" || "Invalid entry";
    },
  },
  {
    type: "input",
    name: "roleId",
    message: "Enter the manager's role ID:",
    validate: function (input) {
      return /^\d+$/.test(input) || "Please enter a valid role ID (numeric).";
    },
  },
];

const entryTypeQuestions = [
  {
    type: "list",
    name: "entryType",
    message: "Are you entering an employee or a manager?",
    choices: ["Employee", "Manager"]
  },
];

async function insertEmployee(employeeData, roleSalary) {
  try {
    const [existingEmployee] = await connectionPool.execute(
      'SELECT id FROM employee WHERE first_name = ? AND last_name = ? AND role_id = ? AND manager_name = ?',
      [employeeData.firstName, employeeData.lastName, employeeData.roleId, employeeData.managerName]
    );

    if (existingEmployee.length) {
      console.log(`Employee already exists with ID: ${existingEmployee[0].id}`);
      return;
    }

    const [rows] = await connectionPool.execute(
      'INSERT INTO employee (first_name, last_name, role_id, manager_name, salary) VALUES (?, ?, ?, ?, ?)',
      [employeeData.firstName, employeeData.lastName, employeeData.roleId, employeeData.managerName, roleSalary]
    );

    console.log(`Inserted employee: ${employeeData.firstName} ${employeeData.lastName} with ID: ${rows.insertId}`);
    displayEntryDetails(employeeData);
  } catch (error) {
    console.error('Error inserting employee:', error);
  }
}

async function insertManager(firstName, lastName, departmentName, roleId) {
  try {
    const [rows] = await connectionPool.execute(
      'INSERT INTO managers (first_name, last_name, department_name, role_id) VALUES (?, ?, ?, ?)',
      [firstName, lastName, departmentName, roleId]
    );

    console.log(`Inserted manager: ${firstName} ${lastName} with ID: ${rows.insertId}`);
    displayEntryDetails({ firstName, lastName, departmentName, roleId });
  } catch (error) {
    console.error('Error inserting manager:', error);
  }
}

async function insertRole(roleName, departmentName, roleSalary) {
  try {
    const [existingRole] = await connectionPool.execute(
      'SELECT id FROM role WHERE title = ? AND department_id IN (SELECT id FROM department WHERE department_name = ?)',
      [roleName, departmentName]
    );

    if (existingRole.length) {
      console.log(`Role already exists with ID: ${existingRole[0].id}`);
      return existingRole[0].id;
    }

    const [rows] = await connectionPool.execute(
      'INSERT INTO role (title, department_id, salary) VALUES (?, (SELECT id FROM department WHERE department_name = ?), ?)',
      [roleName, departmentName, roleSalary]
    );

    console.log(`Successful role entry! New role: ${roleName} with ID: ${rows.insertId}`);
    return rows.insertId;
  } catch (error) {
    console.error('Error inserting role:', error);
    return null;
  }
}

async function insertDepartment(departmentName) {
  try {
    if (!departmentName) {
      console.log("Department name is required.");
      return null;
    }

    const [existingDepartment] = await connectionPool.execute(
      'SELECT id FROM department WHERE department_name = ?',
      [departmentName]
    );

    if (existingDepartment.length) {
      console.log(`Department already exists with ID: ${existingDepartment[0].id}`);
      return existingDepartment[0].id;
    }

    const [rows] = await connectionPool.execute(
      'INSERT INTO department (department_name) VALUES (?)',
      [departmentName]
    );

    console.log(`Inserted new department: ${departmentName} with ID: ${rows.insertId}`);
    console.log("Successful department entry!");
    return rows.insertId;
  } catch (error) {
    console.error('Error inserting department:', error);
    return null;
  }
}

function displayEntryDetails(data) {
  console.log(`Congratulations! You've made a successful entry!\n`);
  console.log("Entry Details:");
  console.log("--------------");
  console.log(`First Name: ${data.firstName}`);
  console.log(`Last Name: ${data.lastName}`);
  console.log(`Department Name: ${data.departmentName || 'N/A'}`);
  console.log(`Role ID: ${data.roleId || 'N/A'}`);
  console.log("--------------\n");
}

async function getManagerName(managerId) {
  const [managerRow] = await connectionPool.execute('SELECT first_name, last_name FROM managers WHERE id = ?', [managerId]);
  return managerRow.length ? `${managerRow[0].first_name} ${managerRow[0].last_name}` : null;
}

async function startManagerInput() {
  const { firstName, lastName, departmentName, roleId } = await inquirer.prompt(managerQuestions);

  const [roleRow] = await connectionPool.execute('SELECT title FROM role WHERE id = ?', [roleId]);
  const roleTitle = roleRow.length ? roleRow[0].title : null;
  console.log(`Role: ${roleTitle || 'Unknown'}`);

  await insertManager(firstName, lastName, departmentName, roleId);
}

async function startDepartmentInput() {
  const { isNewDepartment, departmentName } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isNewDepartment",
      message: "Is this a new department? (Y/N)",
    },
    {
      type: "input",
      name: "departmentName",
      message: "Enter the department name:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
  ]);

  if (isNewDepartment) {
    const departmentId = await insertDepartment(departmentName);
    await startRoleInput(departmentId);
  } else {
    await startRoleInput();
  }
}

async function startRoleInput(departmentId) {
  const { isNewRole } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isNewRole",
      message: "Is this a new role?",
    },
  ]);

  if (isNewRole) {
    const { roleName, roleSalary } = await inquirer.prompt([
      {
        type: "input",
        name: "roleName",
        message: "Enter the new role name:",
        validate: function (input) {
          return input.trim() !== "" || "Invalid entry";
        },
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Enter the new role salary:",
        validate: function (input) {
          return /^\d+$/.test(input) || "Please enter a valid salary (numeric).";
        },
      },
    ]);

    await insertRole(roleName, departmentId, roleSalary);
    await startEmployeeInput();
  } else {
    const { roleId } = await inquirer.prompt([
      {
        type: "input",
        name: "roleId",
        message: "Enter the existing role ID:",
        validate: function (input) {
          return /^\d+$/.test(input) || "Please enter a valid role ID (numeric).";
        },
      },
    ]);

    await startEmployeeInput();
  }
}

async function startEmployeeInput() {
  let roleName = null;
  let roleIdToUpdate = null;
  let roleSalary = null;

  const { firstName, lastName, isNewRole, roleId, managerId } = await inquirer.prompt(employeeQuestions);

  if (isNewRole) {
    const response = await inquirer.prompt([
      {
        type: "input",
        name: "roleName",
        message: "Enter the role name:",
        validate: function (input) {
          return input.trim() !== "" || "Invalid entry";
        },
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Enter the role salary:",
        validate: function (input) {
          return /^\d+$/.test(input) || "Please enter a valid salary (numeric).";
        },
      },
    ]);

    roleName = response.roleName;
    roleSalary = response.roleSalary;

    const newRoleId = await insertRole(roleName, null, roleSalary);
    roleIdToUpdate = newRoleId || roleId;
  } else {
    const roleQuestionIndex = employeeQuestions.findIndex((question) => question.name === "roleId");
    if (roleQuestionIndex !== -1) {
      employeeQuestions.splice(roleQuestionIndex, 1);
    }
    roleIdToUpdate = roleId;
  }

  const [roleRow] = await connectionPool.execute('SELECT title FROM role WHERE id = ?', [roleIdToUpdate]);
  const roleTitle = roleRow.length ? roleRow[0].title : null;
  console.log(`Role: ${roleTitle || 'Unknown'}`);

  const managerName = managerId ? await getManagerName(managerId) : null;
  console.log(`Manager: ${managerName || 'Unknown'}`);

  const employeeData = { firstName, lastName, roleId: roleIdToUpdate, managerName };
  const isConfirmed = await confirmDetails(employeeData);

  if (isConfirmed) {
    await insertEmployee(employeeData, roleSalary);
    console.log('______________________________________________________________________________');
    console.log("Congratulations! You've made a successful employee entry!");
    console.log('______________________________________________________________________________');
    console.log("Crtl + C to Exit Database");
    console.log('______________________________________________________________________________');
    displayEntryDetails(employeeData);
  } else {
    console.log("Entry canceled. Starting over...");
    await startEmployeeInput();
  }
}

async function startInput() {
  const { usageType } = await inquirer.prompt([
    {
      type: "list",
      name: "usageType",
      message: "Are you viewing your database or making an entry?",
      choices: ["View", "Entry"]
    },
  ]);

  if (usageType === "View") {
    const viewOptions = [
      { name: "View All Departments", func: viewAllDepartments },
      { name: "View All Roles", func: viewAllRoles },
      { name: "View All Employees", func: viewAllEmployees },
      { name: "View All Managers", func: viewAllManagers },
      { name: "View All Salaries", func: viewAllSalaries },
    ];

    const { viewChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "viewChoice",
        message: "Choose an option to view:",
        choices: viewOptions.map(option => option.name)
      },
    ]);

    const selectedOption = viewOptions.find(option => option.name === viewChoice);
    if (selectedOption && selectedOption.func) {
      await selectedOption.func();
    }
  } else {
    await startEntryProcess();
  }
}

async function startEntryProcess() {
  const { entryType } = await inquirer.prompt(entryTypeQuestions);

  if (entryType === "Employee") {
    await startEmployeeInput();
  } else if (entryType === "Manager") {
    await startManagerInput();
  }
}

async function confirmDetails(data) {
  console.log("\nPlease confirm the details below:");
  console.log("==================================");
  console.log(`First Name: ${data.firstName}`);
  console.log(`Last Name: ${data.lastName}`);
  console.log(`Department Name: ${data.departmentName || 'N/A'}`);
  console.log(`Role ID: ${data.roleId || 'N/A'}`);
  console.log("==================================");

  const { isConfirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isConfirmed",
      message: "Is the information correct?",
    },
  ]);

  return isConfirmed;
}

async function viewAllDepartments() {
  try {
    const [rows] = await connectionPool.execute('SELECT * FROM department');
    console.log("\nAll Departments:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing departments:', error);
  }
}

async function viewAllRoles() {
  try {
    const [rows] = await connectionPool.execute('SELECT * FROM role');
    console.log("\nAll Roles:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing roles:', error);
  }
}

async function viewAllEmployees() {
  try {
    const [rows] = await connectionPool.execute('SELECT * FROM employee');
    console.log("\nAll Employees:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing employees:', error);
  }
}

async function viewAllManagers() {
  try {
    const [rows] = await connectionPool.execute('SELECT * FROM managers');
    console.log("\nAll Managers:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing managers:', error);
  }
}

async function viewAllSalaries() {
  try {
    const [rows] = await connectionPool.execute('SELECT first_name, last_name, salary FROM employee');
    console.log("\nAll Salaries:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing salaries:', error);
  }
}

startInput();
