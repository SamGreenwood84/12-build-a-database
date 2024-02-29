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

try {
  const figletText = fs.readFileSync(path.join(__dirname, 'Success.txt'), 'utf8');
  execSync(`figlet Success! ${figletText}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error displaying Figlet message:', error.message);
}

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

// Declare employeeQuestions at the top of the file
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
async function insertEmployee(employeeData, roleSalary) {
  try {
    // Check if an employee with the same role and manager already exists
    const [existingEmployee] = await connectionPool.execute('SELECT id FROM employee WHERE first_name = ? AND last_name = ? AND role_id = ? AND manager_id = ?', [employeeData.firstName, employeeData.lastName, employeeData.roleId, employeeData.managerId]);

    if (existingEmployee.length) {
      console.log(`Employee already exists with ID: ${existingEmployee[0].id}`);
      return;
    }

    // If the employee doesn't exist, insert a new one
    const [rows] = await connectionPool.execute('INSERT INTO employee (first_name, last_name, role_id, manager_id, role_salary) VALUES (?, ?, ?, ?, ?)', [employeeData.firstName, employeeData.lastName, employeeData.roleId, employeeData.managerId, roleSalary]);
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
async function insertRole(roleName, departmentId, roleSalary) {
  try {
    if (!departmentId) {
      const newDepartmentId = await insertDepartment();
      departmentId = newDepartmentId || departmentId;
    }

    const [existingRole] = await connectionPool.execute('SELECT id FROM role WHERE title = ? AND department_id = ?', [roleName, departmentId]);

    if (existingRole.length) {
      console.log(`Role already exists with ID: ${existingRole[0].id}`);
      return existingRole[0].id;
    }

    const [rows] = await connectionPool.execute('INSERT INTO role (title, department_id, salary) VALUES (?, ?, ?)', [roleName, departmentId, roleSalary]);
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
    // Check if the departmentName is provided
    if (!departmentName) {
      console.log("Department name is required.");
      return null;
    }

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

async function startEmployeeInput() {
  const { firstName, lastName, isNewRole, roleId, managerId } = await inquirer.prompt(employeeQuestions);

  let roleName = null; // Declare roleName outside the if block
  let roleIdToUpdate = roleId; // Use a separate variable to track roleId updates

  if (isNewRole) {
    // Ask for the role name and insert a new role
    const response = await inquirer.prompt([
      {
        type: "input",
        name: "roleName",
        message: "Enter the role name:",
        validate: function (input) {
          return input.trim() !== "" || "Invalid entry";
        },
      },
    ]);

    roleName = response.roleName;

    // Insert a new role and get the roleId
    const newRoleId = await insertRole(roleName, null);
    roleIdToUpdate = newRoleId || roleIdToUpdate; // Update the variable

    // Display success message for new role
    console.log(`Successful role entry! New role: ${roleName} with ID: ${newRoleId}`);
  } else {
    // If it's not a new role, remove the question about role name
    const roleQuestionIndex = employeeQuestions.findIndex((question) => question.name === "roleName");
    if (roleQuestionIndex !== -1) {
      employeeQuestions.splice(roleQuestionIndex, 1);
    }
  }
}

// Function to fetch and return manager name based on managerId
async function getManagerName(managerId) {
  const [managerRow] = await connectionPool.execute('SELECT first_name, last_name FROM managers WHERE id = ?', [managerId]);
  return managerRow.length ? `${managerRow[0].first_name} ${managerRow[0].last_name}` : null;
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
    const { roleName, roleSalary, departmentId } = await inquirer.prompt([
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
      {
        type: "input",
        name: "departmentId",
        message: "Enter the department Id:",
        validate: function (input) {
          return /^\d+$/.test(input) || "Please enter a valid salary (numeric).";
        },
      },
    ]);

    const roleId = await insertRole(roleName, departmentId || null, roleSalary);

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
    async function viewAllDepartments() {
      try {
        const [rows] = await connectionPool.execute('SELECT * FROM department');
        console.table(rows);
      } catch (error) {
        console.error('Error viewing departments:', error);
      }
    }

  } else if (usageType === "Entry") {
    const { isNewDepartment } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isNewDepartment",
        message: "Are you entering a new department?",
      },
    ]);
    let departmentId = null;
    if (isNewDepartment) {
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

      departmentId = await insertDepartment(departmentName);
    }

    const { isNewRole } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isNewRole",
        message: "Are you entering a new role?",
      },
    ]);

    let roleId = null;
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

      roleId = await insertRole(roleName, departmentId || null, roleSalary);
    }

    const { entryType } = await inquirer.prompt(entryTypeQuestions);

    if (entryType === "Employee") {
      await startEmployeeInput(roleId);
    } else if (entryType === "Manager") {
      await startManagerInput();
    }
  }
}

// Function to confirm details before inserting into the database
async function confirmDetails(data) {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Confirm details:\n${JSON.stringify(data, null, 2)}\nProceed?`,
    },
  ]);

  return confirm;
}
async function startEmployeeInput() {
  let roleName = null;
  let roleIdToUpdate = null;
  let roleSalary = null;

  const { firstName, lastName, isNewRole, roleId, managerId } = await inquirer.prompt(employeeQuestions);

  if (isNewRole) {
    // Ask for the role name and insert a new role
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

    // Insert a new role and get the roleId
    const newRoleId = await insertRole(roleName, null, roleSalary);
    roleIdToUpdate = newRoleId || roleId;
  } else {
    // If it's not a new role, remove the question about role name
    const roleQuestionIndex = employeeQuestions.findIndex((question) => question.name === "roleName");
    if (roleQuestionIndex !== -1) {
      employeeQuestions.splice(roleQuestionIndex, 1);
    }
    roleIdToUpdate = roleId;
  }

  // Fetch and display role title based on roleId
  const [roleRow] = await connectionPool.execute('SELECT title FROM role WHERE id = ?', [roleIdToUpdate]);
  const roleTitle = roleRow.length ? roleRow[0].title : null;
  console.log(`Role: ${roleTitle || 'Unknown'}`);

  // Fetch and display manager name based on managerId
  const managerName = managerId ? await getManagerName(managerId) : null;
  console.log(`Manager: ${managerName || 'Unknown'}`);

// Insert employee data into the database
const employeeData = { firstName, lastName, roleId: roleIdToUpdate, managerId: managerId || null };
const isConfirmed = await confirmDetails(employeeData);

if (isConfirmed) {
  // Pass roleSalary to insertEmployee function
  await insertEmployee(employeeData, roleSalary);
  console.log('______________________________________________________________________________');
  console.log("Congratulations! You've made a successful employee entry!");
  console.log('______________________________________________________________________________');
  console.log("Crtl + C to Exit Database");
  console.log('______________________________________________________________________________');

  // Display entry details
  displayEntryDetails(employeeData);
} else {
  console.log("Entry canceled. Starting over...");
  await startEmployeeInput();
}
}

// Start the input process
startInput();