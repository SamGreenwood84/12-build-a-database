const inquirer = require("inquirer");
const mysql = require("mysql2/promise");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const connectionPool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "1111",
  database: "employee_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//Function to display figlet message
function displaySuccessMessage() {
  try {
    const figletText = fs.readFileSync(
      path.join(__dirname, "Success.txt"),
      "utf8"
    );
    execSync(`figlet Success! ${figletText}`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error displaying Figlet message:", error.message);
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

//employee questions when user chooses to add a new employee
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
      return (
        input === "" ||
        /^\d+$/.test(input) ||
        "Please enter a valid manager ID (numeric) or leave it empty."
      );
    },
  },
];

//Manager questions when User chooses to add a new manager
const managerQuestions = [
  ...commonEmployeeQuestions,
  {
    type: "input",
    name: "departmentId",
    message: "Enter the manager's department ID:",
    validate: function (input) {
      return /^\d+$/.test(input) || "Please enter a valid department ID (numeric).";
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

//Question after User chooses to make an Entry
const entryTypeQuestions = [
  {
    type: "list",
    name: "entryType",
    message: "Are you entering an employee or a manager?",
    choices: ["Employee", "Manager"],
  },
];

// Function to insert employee input into the database
async function insertEmployee(firstName, lastName, title, salary, managerId) {
  try {
    // ...

    const [rows] = await connectionPool.execute(
      "INSERT INTO employee (first_name, last_name, title, salary, manager_id) VALUES (?, ?, ?, ?, ?)",
      [
        firstName,
        lastName,
        title || "Unknown Title",
        salary || null,
        managerId || null,
      ]
    );

    console.log(
      `Inserted employee: ${firstName} ${lastName} with ID: ${rows.insertId}`
    );
  } catch (error) {
    console.error("Error inserting employee:", error);
  }
}

// Function to start the manager input in the command line
async function startManagerInput() {
  const { isNewDepartment } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isNewDepartment",
      message: "Is this a new department?",
    },
  ]);

  let departmentId;

  if (isNewDepartment) {
    departmentId = await startDepartmentInput();
  }

  const { firstName, lastName, roleId } = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter the manager's first name:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter the manager's last name:",
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
  ]);

  let title, salary;

  const [roleRow] = await connectionPool.execute(
    "SELECT title, salary FROM role WHERE id = ?",
    [roleId]
  );

  if (roleRow.length) {
    title = roleRow[0].title;
    salary = roleRow[0].salary;
  } else {
    console.log("Role not found. Please try again.");
    await startManagerInput();
    return;
  }

  console.log(`Role: ${title || "Unknown"}`);
  console.log(`Salary: ${salary || "Unknown"}`);

  try {
    await insertManager(firstName, lastName, departmentId, roleId);
    console.log("Manager added successfully!");
  } catch (error) {
    console.error(`Error inserting manager: ${error.message}`);
  }

  await startEntryProcess();
}

//Function to insert the role input into the database
async function insertRole(roleName, departmentName, roleSalary) {
  try {
    const [existingRole] = await connectionPool.execute(
      "SELECT id FROM role WHERE title = ? AND department_id IN (SELECT id FROM department WHERE department_name = ?)",
      [roleName, departmentName]
    );

    if (existingRole.length) {
      console.log(`Role already exists with ID: ${existingRole[0].id}`);
      return existingRole[0].id;
    }

    const [rows] = await connectionPool.execute(
      "INSERT INTO role (title, department_id, salary) VALUES (?, (SELECT id FROM department WHERE department_name = ?), ?)",
      [roleName, departmentName, roleSalary]
    );

    console.log(
      `Successful role entry! New role: ${roleName} with ID: ${rows.insertId}`
    );
    return rows.insertId;
  } catch (error) {
    console.error("Error inserting role:", error);
    return null;
  }
}

//Funxction to insert the department input into the database
async function insertDepartment(departmentName) {
  try {
    if (!departmentName) {
      console.log("Department name is required.");
      return null;
    }

    const [existingDepartment] = await connectionPool.execute(
      "SELECT id FROM department WHERE department_name = ?",
      [departmentName]
    );

    if (existingDepartment.length) {
      console.log(
        `Department already exists with ID: ${existingDepartment[0].id}`
      );
      return existingDepartment[0].id;
    }

    const [rows] = await connectionPool.execute(
      "INSERT INTO department (department_name) VALUES (?)",
      [departmentName]
    );

    console.log(
      `Inserted new department: ${departmentName} with ID: ${rows.insertId}`
    );
    console.log("Successful department entry!");
    return rows.insertId;
  } catch (error) {
    console.error("Error inserting department:", error);
    return null;
  }
}
//function to display the entry details once they have been entered
function displayEntryDetails(data) {
  console.log(`Congratulations! You've made a successful entry!\n`);
  console.log("Entry Details:");
  console.log("--------------");
  console.log(`First Name: ${data.firstName}`);
  console.log(`Last Name: ${data.lastName}`);
  console.log(`Department Name: ${data.departmentName || "N/A"}`);
  console.log(`Role ID: ${data.roleId || "N/A"}`);
  console.log(`Manager ID: ${data.managerId || "N/A"}`);
  console.log("--------------\n");
}

// Function to start the manager input in the command line
async function startManagerInput() {
  const { isNewDepartment } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isNewDepartment",
      message: "Is this a new department?",
    },
  ]);

  let departmentId;

  if (isNewDepartment) {
    departmentId = await startDepartmentInput();
  }

  const { firstName, lastName, isNewRole, roleId } = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter the manager's first name:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter the manager's last name:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
    {
      type: "confirm",
      name: "isNewRole",
      message: "Is this a new role?",
    },
    {
      type: "input",
      name: "roleId",
      message: "Enter the manager's role ID:",
      when: function (answers) {
        return !answers.isNewRole;
      },
      validate: function (input) {
        return /^\d+$/.test(input) || "Please enter a valid role ID (numeric).";
      },
    },
  ]);

  let title, salary;

  if (isNewRole) {
    const newRoleId = await startRoleInput();
    roleId = newRoleId;
  } else {
    const [roleRow] = await connectionPool.execute(
      "SELECT title, salary FROM role WHERE id = ?",
      [roleId]
    );

    if (roleRow.length) {
      title = roleRow[0].title;
      salary = roleRow[0].salary;
    } else {
      console.log("Role not found. Please try again.");
      await startManagerInput();
      return;
    }

    console.log(`Role: ${title || "Unknown"}`);
    console.log(`Salary: ${salary || "Unknown"}`);
  }

  try {
    await insertManager(firstName, lastName, departmentId, roleId);
    console.log("Manager added successfully!");
  } catch (error) {
    console.error(`Error inserting manager: ${error.message}`);
  }

  await startEntryProcess();
}

// Function to start the department input in the command line
async function startDepartmentInput() {
  const { departmentName } = await inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "Enter the new department name:",
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
  ]);

  const departmentId = await insertDepartment(departmentName);
  return departmentId;
}


// Function to start the role input in the command line
async function startRoleInput() {
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

  const roleId = await insertRole(roleName, null, roleSalary);

  // Call the next function here
  await startEmployeeInput();

  return roleId;
}

async function startEmployeeInput() {
  const response = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter employee's first name:",
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter employee's last name:",
    },
    {
      type: "input",
      name: "roleId",
      message: "Enter employee's role ID:",
      validate: function (input) {
        return /^\d+$/.test(input) || "Please enter a valid role ID (numeric).";
      },
    },
    {
      type: "input",
      name: "managerId",
      message: "Enter employee's manager ID:",
    },
  ]);

  if (
    !response.firstName ||
    !response.lastName ||
    !response.roleId ||
    !response.managerId
  ) {
    console.log("All fields are required. Please try again.");
    await startEmployeeInput();
    return;
  }

  let title, salary;

  if (!response.roleId) {
    console.log("Role ID is required. Please try again.");
    await startEmployeeInput();
    return;
  } else {
    const [roleRow] = await connectionPool.execute(
      "SELECT title, salary FROM role WHERE id = ?",
      [response.roleId]
    );
    title = roleRow.length ? roleRow[0].title : null;
    salary = roleRow.length ? roleRow[0].salary : null;
  }

  console.log(`Role: ${title || "Unknown"}`);

  if (!response.managerId) {
    console.log("Manager ID is required. Please try again.");
    await startEmployeeInput();
    return;
  }

  const [managerRow] = await connectionPool.execute(
    "SELECT id FROM managers WHERE id = ?",
    [response.managerId]
  );

  const managerId = managerRow.length ? managerRow[0].id : null;

  if (!managerId) {
    console.log("Manager not found. Please try again.");
    await startEmployeeInput();
    return;
  }

  console.log(`Manager ID: ${response.managerId}`);

  try {
    await insertEmployee(
      response.firstName,
      response.lastName,
      title || "Unknown Title",
      salary || null,
      managerId || null
    );
    console.log("Employee added successfully!");
  } catch (error) {
    console.error(`Error inserting employee: ${error.message}`);
  }

  await startEntryProcess();
}

//Function to start questions for User to choose to View their database or Make and Entry
async function startInput() {
  const { usageType } = await inquirer.prompt([
    {
      type: "list",
      name: "usageType",
      message: "Are you viewing your database or making an entry?",
      choices: ["View", "Entry"],
    },
  ]);
//If statemnent if the User chooses View instead of Entry
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
        choices: viewOptions.map((option) => option.name),
      },
    ]);

    const selectedOption = viewOptions.find(
      (option) => option.name === viewChoice
    );
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
  console.log(`Department Name: ${data.departmentName || "N/A"}`);
  console.log(`Role ID: ${data.roleId || "N/A"}`);
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
    const [departmentRows] = await connectionPool.execute(
      "SELECT * FROM department"
    );
    console.log("\nAll Departments:");
    console.table(departmentRows);

    // View all roles
    const [roleRows] = await connectionPool.execute("SELECT * FROM role");
    console.log("\nAll Roles:");
    console.table(roleRows);

    // View all employees
    const [employeeRows] = await connectionPool.execute(
      "SELECT * FROM employee"
    );
    console.log("\nAll Employees:");
    console.table(employeeRows);

    // View all managers
    const [managerRows] = await connectionPool.execute(
      "SELECT * FROM managers"
    );
    console.log("\nAll Managers:");
    console.table(managerRows);
  } catch (error) {
    console.error("Error viewing tables:", error);
  }
}
//functions to view the database or view by tables from the command line once the User chooses View your database
async function viewAllDepartments() {
  try {
    const [rows] = await connectionPool.execute("SELECT * FROM department");
    console.log("\nAll Departments:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing departments:", error);
  }
}

async function viewAllRoles() {
  try {
    const [rows] = await connectionPool.execute("SELECT * FROM role");
    console.log("\nAll Roles:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing roles:", error);
  }
}

async function viewAllEmployees() {
  try {
    const [rows] = await connectionPool.execute("SELECT * FROM employee");
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
      "SELECT first_name, last_name, salary FROM employee"
    );
    console.log("\nAll Salaries:");
    console.table(rows);
  } catch (error) {
    console.error("Error viewing salaries:", error);
  }
}

startInput();
