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

const entryTypeQuestions = [
  {
    type: "list",
    name: "entryType",
    message: "Are you entering an employee or a manager?",
    choices: ["Employee", "Manager"],
  },
];

async function insertEmployee(firstName, lastName, roleId, managerId) {
  const query =
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
  const values = [firstName, lastName, roleId, managerId === null || managerId === "" ? null : managerId];

  return new Promise((resolve, reject) => {
    connectionPool.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.insertId);
      }
    });
  });
}

async function insertManager(firstName, lastName, departmentId, roleId) {
  try {
    const [rows] = await connectionPool.execute(
      "INSERT INTO managers (first_name, last_name, department_id, role_id) VALUES (?, ?, ?, ?)",
      [firstName, lastName, departmentId, roleId]
    );

    console.log(
      `Inserted manager: ${firstName} ${lastName} with ID: ${rows.insertId}`
    );
  } catch (error) {
    console.error("Error inserting manager:", error);
    throw error;
  }
}

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

    let departmentId;

    if (departmentName) {
      [departmentRows] = await connectionPool.execute(
        "INSERT INTO department (department_name) VALUES (?)",
        [departmentName]
      );
      departmentId = departmentRows.insertId;
      console.log(`New department '${departmentName}' added with ID: ${departmentId}`);
    } else {
      departmentId = null;
    }

    const [rows] = await connectionPool.execute(
      "INSERT INTO role (title, department_id, salary) VALUES (?, ?, ?)",
      [roleName, departmentId, roleSalary]
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
    {
      type: "confirm",
      name: "isNewDepartment",
      message: "Is this a new department?",
    },
    {
      type: "input",
      name: "departmentName",
      message: "Enter the new department name:",
      when: function (answers) {
        return answers.isNewDepartment;
      },
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
  ]);

  const roleId = await insertRole(roleName, roleSalary, roleSalary);
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
      type: "confirm",
      name: "isNewRole",
      message: "Is this a new role?",
    },
    {
      type: "input",
      name: "roleId",
      message: "Enter employee's role ID:",
      when: function (answers) {
        return !answers.isNewRole;
      },
      validate: function (input) {
        return /^\d+$/.test(input) || "Please enter a valid role ID (numeric).";
      },
    },
    {
      type: "confirm",
      name: "isNewDepartment",
      message: "Is this a new department?",
      when: function (answers) {
        return !answers.isNewRole;
      },
    },
    {
      type: "input",
      name: "departmentName",
      message: "Enter the new department name:",
      when: function (answers) {
        return answers.isNewDepartment;
      },
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
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
  ]);

  let roleId;

  if (response.isNewRole) {
    const { roleName, roleSalary, isNewDepartment } = await inquirer.prompt([
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
        type: "confirm",
        name: "isNewDepartment",
        message: "Is this a new department for the role?",
      },
    ]);

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

      roleId = await insertRole(roleName, departmentName, roleSalary);
    } else {
      roleId = await insertRole(roleName, null, roleSalary);
    }
  } else {
    roleId = response.roleId;
  }

  try {
    await insertEmployee(
      response.firstName,
      response.lastName,
      roleId,
      response.managerId || null
    );
    console.log("Employee added successfully!");

    const { makeAnotherEntry } = await inquirer.prompt([
      {
        type: "confirm",
        name: "makeAnotherEntry",
        message: "Do you want to make another entry?",
      },
    ]);

    if (makeAnotherEntry) {
      await startEntryProcess();
    } else {
      console.log("Thank you for using Your Employee Database. Goodbye!");
      process.exit();
    }
  } catch (error) {
    console.error(`Error inserting employee: ${error.message}`);
    await startEmployeeInput();
  }
}

async function startManagerInput() {
  const response = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter manager's first name:",
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter manager's last name:",
    },
    {
      type: "confirm",
      name: "isNewRole",
      message: "Is this a new role?",
    },
    {
      type: "input",
      name: "roleId",
      message: "Enter manager's role ID:",
      when: function (answers) {
        return !answers.isNewRole;
      },
      validate: function (input) {
        return /^\d+$/.test(input) || "Please enter a valid role ID (numeric).";
      },
    },
    {
      type: "confirm",
      name: "isNewDepartment",
      message: "Is this a new department?",
      when: function (answers) {
        return !answers.isNewRole;
      },
    },
    {
      type: "input",
      name: "departmentName",
      message: "Enter the new department name:",
      when: function (answers) {
        return answers.isNewDepartment;
      },
      validate: function (input) {
        return input.trim() !== "" || "Invalid entry";
      },
    },
    {
      type: "input",
      name: "managerId",
      message: "Enter the manager's manager ID (optional, press Enter to skip):",
      validate: function (input) {
        return (
          input === "" ||
          /^\d+$/.test(input) ||
          "Please enter a valid manager ID (numeric) or leave it empty."
        );
      },
    },
  ]);

  let roleId;

  if (response.isNewRole) {
    const { roleName, roleSalary, isNewDepartment } = await inquirer.prompt([
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
        type: "confirm",
        name: "isNewDepartment",
        message: "Is this a new department for the role?",
      },
    ]);

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

      roleId = await insertRole(roleName, departmentName, roleSalary);
    } else {
      roleId = await insertRole(roleName, null, roleSalary);
    }
  } else {
    roleId = response.roleId;
  }

  try {
    await insertEmployee(
      response.firstName,
      response.lastName,
      roleId,
      response.managerId || null
    );
    console.log("Manager added successfully!");

    const { makeAnotherEntry } = await inquirer.prompt([
      {
        type: "confirm",
        name: "makeAnotherEntry",
        message: "Do you want to make another entry?",
      },
    ]);

    if (makeAnotherEntry) {
      await startManagerInput();
    } else {
      console.log("Thank you for using Your Employee Database. Goodbye!");
      process.exit();
    }
  } catch (error) {
    console.error(`Error inserting manager: ${error.message}`);
    await startManagerInput();
  }
}

async function startInput() {
  const { usageType } = await inquirer.prompt([
    {
      type: "list",
      name: "usageType",
      message: "Are you viewing your database or making an entry?",
      choices: ["View", "Entry"],
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

async function viewAllTables() {
  try {
    const [departmentRows] = await connectionPool.execute(
      "SELECT * FROM departments"
    );
    console.log("\nAll Departments:");
    console.table(departmentRows);

    const [roleRows] = await connectionPool.execute("SELECT * FROM roles");
    console.log("\nAll Roles:");
    console.table(roleRows);

    const [employeeRows] = await connectionPool.execute(
      "SELECT * FROM employees"
    );
    console.log("\nAll Employees:");
    console.table(employeeRows);

    const [managerRows] = await connectionPool.execute(
      "SELECT * FROM managers"
    );
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
  
  startInput();
