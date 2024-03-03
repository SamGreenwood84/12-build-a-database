const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs").promises;

async function displaySuccessMessage() {
  try {
    const figletText = await fs.readFile(
      path.join(__dirname, "Success.txt"),
      "utf8"
    );
    execSync(`figlet Success! ${figletText}`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error displaying Figlet message:", error.message);
  }
}

module.exports = {
  displaySuccessMessage,
};