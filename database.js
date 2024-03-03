// database.js

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

async function viewDatabase() {
  // ... (unchanged)
}

async function startEntryProcess() {
  // ... (unchanged)
}

module.exports = {
  startInput,
  viewDatabase,
  startEntryProcess,
};