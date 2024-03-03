// database.js
const { connectionPool } = require("./Config/connection");
const inquirer = require("inquirer");
const {
    startEntryProcess,
    startInput,
    startEmployeeInput,
    startManagerInput,
} = require("./databaseFunctions");

async function startInput() {
  try {
    const { usageType } = await inquirer.prompt([
      {
        type: "list",
        name: "usageType",
        message: "Are you viewing your database or making an entry?",
        choices: ["View", "Entry"],
      },
    ]);

    if (usageType === "View") {
      await viewDatabase();
    } else {
      await startEntryProcess();
    }
  } catch (error) {
    console.error("Error in startInput:", error);
  }
}

async function startEntryProcess() {
  const { entryType } = await inquirer.prompt([
    {
      type: "list",
      name: "entryType",
      message: "What type of entry would you like to make?",
      choices: ["Employee", "Manager"],
    },
  ]);

  if (entryType === "Employee") {
    await startEmployeeInput();
  } else if (entryType === "Manager") {
    await startManagerInput();
  }
}

async function startEmployeeInput() {
  try {
    const response = await inquirer.prompt([
      ...databaseFunctions.commonEmployeeQuestions,
    ]);

    let roleId;

    // Check if it's a new role
    if (await databaseFunctions.isNewRole()) {
      const { roleTitle, roleSalary } = await inquirer.prompt([
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
            const isValid = /^\d+$/.test(input) && parseFloat(input) > 0;
            return isValid || "Please enter a valid positive salary (numeric).";
          },
        },
      ]);

      roleId = await databaseFunctions.insertRoleAndDepartment(
        roleTitle,
        null,
        roleSalary
      );
    } else {
      const { existingRoleId } = await inquirer.prompt([
        {
          type: "input",
          name: "existingRoleId",
          message: "Enter the existing role ID:",
          validate: function (input) {
            return (
              /^\d+$/.test(input) || "Please enter a valid role ID (numeric)."
            );
          },
        },
      ]);
      roleId = existingRoleId;
    }

    const employeeData = await inquirer.prompt([
      {
        type: "input",
        name: "managerId",
        message:
          "Enter the employee's manager ID (optional, press Enter to skip):",
        validate: function (input) {
          return (
            input === "" ||
            /^\d+$/.test(input) ||
            "Please enter a valid manager ID (numeric) or leave it empty."
          );
        },
      },
    ]);

    await databaseFunctions.insertEmployee(
      response.firstName,
      response.lastName,
      roleId,
      employeeData.managerId
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
      await databaseFunctions.startEntryProcess();
    } else {
      console.log("Thank you for using Your Employee Database. Goodbye!");
      process.exit();
    }
  } catch (error) {
    console.error(`Error inserting employee: ${error.message}`);
    await databaseFunctions.startEmployeeInput();
  }
}

async function startManagerInput() {
  try {
    const response = await inquirer.prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter manager's first name:",
        validate: function (input) {
          return input.trim() !== "" || "Invalid entry";
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter manager's last name:",
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
        message: "Enter manager's role ID:",
        when: function (answers) {
          return !answers.isNewRole;
        },
        validate: function (input) {
          return (
            /^\d+$/.test(input) || "Please enter a valid role ID (numeric)."
          );
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
    ]);

    let roleId;

    // Checks if it's a new role
    if (response.isNewRole) {
      const { roleTitle, roleSalary } = await inquirer.prompt([
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
            const isValid = /^\d+$/.test(input) && parseFloat(input) > 0;
            return isValid || "Please enter a valid positive salary (numeric).";
          },
        },
      ]);

      roleId = await databaseFunctions.insertRoleAndDepartment(
        roleTitle,
        response.departmentName,
        roleSalary
      );
    } else {
      const { existingRoleId } = await inquirer.prompt([
        {
          type: "input",
          name: "existingRoleId",
          message: "Enter the existing role ID:",
          validate: function (input) {
            return (
              /^\d+$/.test(input) || "Please enter a valid role ID (numeric)."
            );
          },
        },
      ]);
      roleId = existingRoleId;
    }

    const managerData = await inquirer.prompt([
      {
        type: "confirm",
        name: "makeAnotherEntry",
        message: "Do you want to make another entry?",
      },
    ]);

    await databaseFunctions.insertManager(
      response.firstName,
      response.lastName,
      response.departmentName,
      roleId
    );

    console.log("Manager added successfully!");

    if (managerData.makeAnotherEntry) {
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

module.exports = {
  startInput,
  startEntryProcess,
  startEmployeeInput,
  startManagerInput,
};
