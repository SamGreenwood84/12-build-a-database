const inquirer = require("inquirer");
const mysql = require("mysql2/promise");

const connectionPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1111',
  database: 'employee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log(".............................................");
console.log("Welcome to Your Employee Database!");
console.log("Enter employee details to add to the database.");

const startQuestions = [
  {
    type: "list",
    name: "usageType",
    message: "Are you viewing your database or making an entry?",
    choices: ["View", "Entry"]
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

const employeeQuestions = [
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
  {
    type: "confirm",
    name: "isNewRole",
    message: "Is this a new role?",
  },
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
  {
    type: "input",
    name: "firstName",
    message: "Enter the manager's first name:",
    validate: function (input) {
      return input.trim() !== "" || "Invalid Entry.";
    },
  },
  {
    type: "input",
    name: "lastName",
    message: "Enter the manager's last name:",
    validate: function (input) {
      return input.trim() !== "" || "Invalid Entry";
    },
  },
  {
    type: "confirm",
    name: "isNewDepartment",
    message: "Is this a new department?",
  },
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

// Function to insert employee data into the database
async function insertEmployee(employeeData) {
  try {
    // Check if an employee with the same role and manager already exists
    const [existingEmployee] = await connectionPool.execute('SELECT id FROM employee WHERE first_name = ? AND last_name = ? AND role_id = ? AND manager_id = ?', [employeeData.firstName, employeeData.lastName, employeeData.roleId, employeeData.managerId]);

    if (existingEmployee.length) {
      console.log(`Employee already exists with ID: ${existingEmployee[0].id}`);
      return;
    }

    // If the employee doesn't exist, insert a new one
    const [rows] = await connectionPool.execute('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [employeeData.firstName, employeeData.lastName, employeeData.roleId, employeeData.managerId]);
    console.log(`Inserted employee: ${employeeData.firstName} ${employeeData.lastName} with ID: ${rows.insertId}`);
    displayEntryDetails(employeeData);
  } catch (error) {
    console.error('Error inserting employee:', error);
  }
}

// Function to insert manager data into the database
async function insertManager(firstName, lastName, departmentId, roleId) {
  try {
    // Convert departmentId to integer
    departmentId = parseInt(departmentId);

    const [rows] = await connectionPool.execute(
      'INSERT INTO managers (first_name, last_name, department_id, role_id) VALUES (?, ?, ?, ?)',
      [firstName, lastName, departmentId, roleId]
    );
    console.log(`Inserted manager: ${firstName} ${lastName} with ID: ${rows.insertId}`);
    displayEntryDetails({ firstName, lastName, departmentId, roleId });
  } catch (error) {
    console.error('Error inserting manager:', error);
  }
}

// Function to insert role data into the database or retrieve existing role ID
async function insertRole(roleName, departmentId) {
  try {
    if (!departmentId) {
      // If it's a new department, insert the department first
      const newDepartmentId = await insertDepartment();
      departmentId = newDepartmentId || departmentId;
    }

    // Check if the role already exists
    const [existingRole] = await connectionPool.execute('SELECT id FROM role WHERE title = ? AND department_id = ?', [roleName, departmentId]);

    if (existingRole.length) {
      console.log(`Role already exists with ID: ${existingRole[0].id}`);
      return existingRole[0].id;
    }

    // If the role doesn't exist, insert a new one and retrieve the generated ID
    const [rows] = await connectionPool.execute('INSERT INTO role (title, department_id) VALUES (?, ?)', [roleName, departmentId]);
    console.log(`Successful role entry! New role: ${roleName} with ID: ${rows.insertId}`);
    return rows.insertId;
  } catch (error) {
    console.error('Error inserting role:', error);
    return null;
  }
}

// Function to insert department data into the database or retrieve existing department ID
async function insertDepartment(departmentName) {
  try {
    // Check if the department already exists
    const [existingDepartment] = await connectionPool.execute('SELECT id FROM department WHERE name = ?', [departmentName]);

    if (existingDepartment.length) {
      console.log(`Department already exists with ID: ${existingDepartment[0].id}`);
      return existingDepartment[0].id;
    }

    // If the department doesn't exist, insert a new one and retrieve the generated ID
    const [rows] = await connectionPool.execute('INSERT INTO department (name) VALUES (?)', [departmentName]);
    console.log(`Inserted new department: ${departmentName} with ID: ${rows.insertId}`);
    console.log("Successful department entry!");
    return rows.insertId;
  } catch (error) {
    console.error('Error inserting department:', error);
    return null;
  }
}

// Function to display entry details
function displayEntryDetails(data) {
  console.log(`Congratulations! You've made a successful entry!\n`);
  console.log("Entry Details:");
  console.log("--------------");
  console.log(`First Name: ${data.firstName}`);
  console.log(`Last Name: ${data.lastName}`);
  console.log(`Department ID: ${data.departmentId || 'N/A'}`);
  console.log(`Role ID: ${data.roleId || 'N/A'}`);
  console.log("--------------\n");
}

// Function to start the employee input process
async function startEmployeeInput() {
  const { firstName, lastName, roleId, managerId } = await inquirer.prompt(employeeQuestions);

  // Fetch and display role title based on roleId
  const [roleRow] = await connectionPool.execute('SELECT title FROM role WHERE id = ?', [roleId]);
  const roleTitle = roleRow.length ? roleRow[0].title : null;
  console.log(`Role: ${roleTitle || 'Unknown'}`);

  // Fetch and display manager name based on managerId
  const [managerRow] = await connectionPool.execute('SELECT first_name, last_name FROM managers WHERE id = ?', [managerId]);
  const managerName = managerRow.length ? `${managerRow[0].first_name} ${managerRow[0].last_name}` : null;
  console.log(`Manager: ${managerName || 'Unknown'}`);

  // Insert employee data into the database
  await insertEmployee({ firstName, lastName, roleId, managerId });
}

// Function to start the manager input process
async function startManagerInput() {
  const { firstName, lastName, departmentId, roleId } = await inquirer.prompt(managerQuestions);

  // Fetch and display department name based on departmentId
  const [departmentRow] = await connectionPool.execute('SELECT name FROM department WHERE id = ?', [departmentId]);
  const departmentName = departmentRow.length ? departmentRow[0].name : null;
  console.log(`Department: ${departmentName || 'Unknown'}`);

  // Fetch and display role title based on roleId
  const [roleRow] = await connectionPool.execute('SELECT title FROM role WHERE id = ?', [roleId]);
  const roleTitle = roleRow.length ? roleRow[0].title : null;
  console.log(`Role: ${roleTitle || 'Unknown'}`);

  // Insert manager data into the database
  await insertManager(firstName, lastName, departmentId, roleId);
}

// Function to start the department input process
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
    // Insert department into the database
    const departmentId = await insertDepartment(departmentName);
    await startRoleInput(departmentId);
  } else {
    // Start the role input process directly
    await startRoleInput();
  }
}

// Function to start the role input process
async function startRoleInput(departmentId) {
  const { isNewRole } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isNewRole",
      message: "Is this a new role?",
    },
  ]);

  if (isNewRole) {
    // Insert role into the database
    const { roleName } = await inquirer.prompt([
      {
        type: "input",
        name: "roleName",
        message: "Enter the role name:",
        validate: function (input) {
          return input.trim() !== "" || "Invalid entry";
        },
      },
    ]);

    const roleId = await insertRole(roleName, departmentId);

    if (roleId) {
      if (departmentId) {
        // If departmentId is provided, it means we're adding a new role to an existing department
        await startEmployeeInput();
      } else {
        // If departmentId is not provided, it means we're adding a new role to a new department
        await startDepartmentInput();
      }
    }
  } else {
    // Prompt for the existing role ID
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

    // Continue to employee input
    await startEmployeeInput();
  }
}


// Function to start the entire input process
async function startInput() {
  const { usageType } = await inquirer.prompt(startQuestions);

  if (usageType === "View") {
    // Implement view logic
    console.log("Viewing the database...");
  } else if (usageType === "Entry") {
    const { entryType } = await inquirer.prompt(entryTypeQuestions);

    if (entryType === "Employee") {
      // Start the employee input process
      await startEmployeeInput();
    } else if (entryType === "Manager") {
      // Start the manager input process
      await startManagerInput();
    }
  }
}

// Start the input process
startInput();
