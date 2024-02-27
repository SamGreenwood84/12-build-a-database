const inquirer = require("inquirer");
const fs = require("fs");

console.log(".............................................");
console.log("Welcome to Your Employee Database!");
console.log("Enter department details to add to the database.");
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

function addDepartment() {
  // Logic to insert department data into the database
  // You need to implement the connection and query logic similar to employee input
  console.log("Add department logic here.");
}

function startDepartmentInput() {
  inquirer.prompt(departmentQuestions).then(addDepartment);
}

startDepartmentInput();
