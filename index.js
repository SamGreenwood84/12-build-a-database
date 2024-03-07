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
    name: "title",
    message: "Enter their role title:",
    validate: function (input) {
      return input.trim() !== "" || "Enter a valid role title";
    },
  },
  {
    type: "input",
    name: "salary",
    message: "Enter the new role salary:",
    validate: function (input) {
      return /^\d+$/.test(input) || "Please enter a valid salary (numeric).";
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

const roleQuestions = [
{
  type: "input",
  name: "roleTitle",
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
    const isValid = /^\d+$/.test(input) && parseFloat(input) > 0;
    return isValid || "Please enter a valid positive salary (numeric).";
  },
},
]

const entryTypeQuestions = [
  {
    type: "list",
    name: "entryType",
    message: "Are you entering an employee, manager, department or role?",
    choices: ["Employee", "Manager", "Department", "Role"]
  },
];

async function insertEmployee(employeeData) {
  try {
    const [existingEmployee] = await connectionPool.execute(
      'SELECT id FROM employees WHERE first_name = ? AND last_name = ? AND title = ? AND salary = ? AND manager_id = ?',
      [employeeData.firstName, employeeData.lastName, employeeData.title, employeeData.salary, employeeData.managerId]
    );

    if (existingEmployee.length) {
      console.log(`Employee already exists with ID: ${existingEmployee[0].id}`);
      return;
    }

    // Validate manager_id before inserting
    const managerId = parseInt(employeeData.managerId, 10);
    if (isNaN(managerId)) {
      console.error('Invalid manager_id. Please provide a valid integer value.');
      return;
    }

    const [rows] = await connectionPool.execute(
      'INSERT INTO employees (first_name, last_name, title, salary, manager_id) VALUES (?, ?, ?, ?, ?)',
      [employeeData.firstName, employeeData.lastName, employeeData.title, employeeData.salary, managerId]
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

async function insertRole(title, salary, departmentId) {
  try {
    const [existingRole] = await connectionPool.execute(
      'SELECT id FROM roles WHERE title = ? AND salary = ? AND department_id = ?',
      [title, salary, departmentId]
    );

    if (existingRole.length) {
      console.log(`Role already exists with ID: ${existingRole[0].id}`);
      return existingRole[0].id;
    }

    const [rows] = await connectionPool.execute(
      'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
      [title, salary, departmentId]
    );

    console.log(`Successful role entry! New role: ${title} with ID: ${rows.insertId}`);
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
      'SELECT id FROM departments WHERE department_name = ?',
      [departmentName]
    );

    if (existingDepartment.length) {
      console.log(`Department already exists with ID: ${existingDepartment[0].id}`);
      return existingDepartment[0].id;
    }

    const [rows] = await connectionPool.execute(
      'INSERT INTO departments (department_name) VALUES (?)',
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

  const [roleRow] = await connectionPool.execute('SELECT title FROM roles WHERE id = ?', [roleId]);
  const roleTitle = roleRow.length ? roleRow[0].title : null;
  console.log(`Role: ${roleTitle || 'Unknown'}`);

  await insertManager(firstName, lastName, departmentName, roleId);
}

async function startEmployeeInput() {

  const employeeData = await inquirer.prompt(employeeQuestions);
  console.log(employeeData);

  insertEmployee(employeeData);
}

async function startRoleInput() {
  const roleData = await inquirer.prompt([
    {
      type: "input",
      name: "roleTitle",
      message: "Enter the new role title:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
    {
      type: "input",
      name: "roleSalary",
      message: "Enter the new role salary:",
      validate: function (input) {
        const isValid = /^\d+(\.\d{1,2})?$/.test(input) && parseFloat(input) > 0;
        return isValid || "Please enter a valid positive salary (numeric).";
      },
    },
  ]);

  const departmentName = await inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "Enter the department name for the role:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
  ]);

  roleData.departmentName = departmentName.departmentName;

  const isConfirmed = await confirmDetails(roleData);

  if (isConfirmed) {
    const roleId = await insertRole(roleData.roleTitle, roleData.roleSalary, roleData.departmendId);
    if (roleId) {
      console.log(`Inserted role with ID: ${roleId}`);
    } else {
      console.log("Error inserting role.");
    }
  } else {
    console.log("Entry canceled by user.");
  }
}

async function startDepartmentInput() {
  const departmentData = await inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "Enter the new department name:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
  ]);

  const isConfirmed = await confirmDetails(departmentData);

  if (isConfirmed) {
    const departmentId = await insertDepartment(departmentData.departmentName);
    if (departmentId) {
      console.log(`Inserted department with ID: ${departmentId}`);
    } else {
      console.log("Error inserting department.");
    }
  } else {
    console.log("Entry canceled by user.");
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
      { name: "View All Tables", func: viewAllTables },
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
  }else if (entryType === "Department") {
    await startDepartmentInput();
  }else if (entryType === "Role") {
    await startRoleInput();
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

async function viewAllTables() {
  try {
    // View all departments
    const [departmentRows] = await connectionPool.execute('SELECT * FROM departments');
    console.log("\nAll Departments:");
    console.table(departmentRows);

    // View all roles
    const [roleRows] = await connectionPool.execute('SELECT * FROM roles');
    console.log("\nAll Roles:");
    console.table(roleRows);

    // View all employees
    const [employeeRows] = await connectionPool.execute('SELECT * FROM employees');
    console.log("\nAll Employees:");
    console.table(employeeRows);

    // View all managers
    const [managerRows] = await connectionPool.execute('SELECT * FROM managers');
    console.log("\nAll Managers:");
    console.table(managerRows);

  } catch (error) {
    console.error('Error viewing tables:', error);
  }
}

async function viewAllDepartments() {
  try {
    const [rows] = await connectionPool.execute('SELECT * FROM departments');
    console.log("\nAll Departments:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing departments:', error);
  }
}

async function viewAllRoles() {
  try {
    const [rows] = await connectionPool.execute('SELECT * FROM roles');
    console.log("\nAll Roles:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing roles:', error);
  }
}

async function viewAllEmployees() {
  try {
    const [rows] = await connectionPool.execute('SELECT * FROM employees');
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
    const [rows] = await connectionPool.execute('SELECT first_name, last_name, salary FROM employees');
    console.log("\nAll Salaries:");
    console.table(rows);
  } catch (error) {
    console.error('Error viewing salaries:', error);
  }
}

startInput();