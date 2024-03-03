const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const inquirer = require("inquirer");
const connectionPool = require("./Config/connection");

console.log(".............................................");
console.log("Welcome to Your Employee Database!");

async function displaySuccessMessage() {
  try {
    // You can remove this part if "Success.txt" is not needed
    // const figletText = await fs.readFile(
    //   path.join(__dirname, "Success.txt"),
    //   "utf8"
    // );
    execSync(`figlet Success!`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error displaying Figlet message:", error.message);
  }
}

displaySuccessMessage();