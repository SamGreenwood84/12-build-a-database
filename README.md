# 12-build-a-database
SQL Challenge: Employee Tracker

# Table of Contents



# Live Demo Video



# Getting Started

1. Clone gitHub repository
2. NPM Install
3. Use command node index.js

# User Story

AS A business owner

I WANT to be able to view and add the departments, roles, managers and employees in my company

SO THAT I can help plan for growth and organize employee data

# Acceptance Criteria

GIVEN a command-line application that accepts user input

WHEN I start the application

THEN I am presented with a figlet message "EmployeeDatabase"

THEN I am presented with the following options: 

```java
      message: "Are you viewing your database, making an entry, or editing?",
      choices: ["View", "Entry", "Edit"],
```

WHEN I choose to View 

THEN I am presented with a set of options in the command line

```java
? Choose an option to view: (Use arrow keys)
> View All Tables
  View All Departments
  View All Roles
  View All Employees
  View All Managers
  View All Salaries
```

WHEN I choose View All <CHOICE>> 

THEN I am presented with the TABLE, for example the employees TABLE;

```java
All Employees:
┌─────────┬────┬────────────┬────────────────────┬────────────────────┬──────────┬────────────────────┐
│ (index) │ id │ first_name │     last_name      │       title        │  salary  │    manager_name    │
├─────────┼────┼────────────┼────────────────────┼────────────────────┼──────────┼────────────────────┤
│    0    │ 1  │  'Eddie'   │     'Cheddar'      │    'Sales Lead'    │ '100000' │ 'Chance TheRapper' │
│    1    │ 2  │  'Crash'   │    'Bandicoot'     │ 'Account Analyst'  │ '50000'  │    'Joe Biden'     │
│    2    │ 3  │  'Kevin'   │      'Malone'      │    'Accountant'    │ '60000'  │   'Bart Simpson'   │
│    3    │ 4  │   'Mary'   │       'Jane'       │ 'Employee Support' │ '60000'  │    'Snow White'    │
│    4    │ 5  │  'Buffy'   │ 'Thevampireslayer' │   'Account Rep'    │ '70000'  │   'Busta Rhymes'   │
│    5    │ 6  │  'Hewho'   │ 'Shallnotbenamed'  │      'Guard'       │ '40000'  │  'Stewie Griffin'  │
└─────────┴────┴────────────┴────────────────────┴────────────────────┴──────────┴────────────────────┘

```
ALSO I am presented with the Exit or Start Over option below each TABLE;

```java
? Do you want to exit or start over? 
```

WHEN I choose Start Over then I will be presented with View or Entry options again

WHEN I choose to make an entry

THEN I am presented with: ? Are you entering an employee, manager, department or role? 

WHEN I make the choice department

THEN I am presented with ? Enter the new department name

WHEN I enter the deparment name I am presented with:

```java
Inserted new department: Janitorial Services with ID: 11
Successful department entry!
```
THEN I am asked to Exit or Start Over

WHEN I choose Start Over 

THEN I am presented with the options again ? Are you entering an employee, manager, department or role? 

WHEN I choose role

THEN I am presented with ? Enter the new role title:

WHEN I enter the new role title

THEN I am presented with ? Enter the new role salary:

WHEN I enter the salary

THEN I am presented with ? Enter the department Id: 

WHEN I enter the deaprtment Id I am presented with: 

```java
Inserted new role: Janitor with ID: 14
Successful role entry!
```
THEN I am asked to Exit or Start Over

WHEN I choose Start Over 

THEN I am presented with the options again ? Are you entering an employee, manager, department or role? 

WHEN I choose employee

THEN I am presented with ? Enter employee's first name, Enter employee's last name, role title, salary, manager Id:

WHEN I enter all the requested information

THEN I am presented with 

```java
Inserted new employee: John Snow with title: Janitor with salary: 40000 with manager Id: 6 with ID: 14
Successful employee entry!
```
THEN I am asked to Exit or Start Over

WHEN I choose Start Over 

THEN I am presented with the options again ? Are you entering an employee, manager, department or role? 

WHEN I choose manager 

THEN I am presented with ? Enter managers's first name, Enter managers's last name, department name, roleID:

WHEN I enter all the requested information

THEN I am presented with

```java
Inserted new manager: Jane Eyre with title: Marketing Manager with salary: 90000 with department Id: 7 with ID: 7
Successful manager entry!
```
THEN I am asked to Exit or Start Over

WHEN I choose Exit

THEN I have finished my entires and exit the database

# Future Development

**Complete the Edit Function**

# References 

Bootcamp Spot MySQL2 for node.js, inquirer

Referenced code from Project 2-Dungeons & Devs: [GitHub Link](https://github.com/Maximilian93B/DungeonsAndDevs.git), Challenge 9 and Challenge 10

Tutor Samuel Cordova-Help with file structre and connection to employee_db

Figet Installation: [Cloudsmith.com](https://cloudsmith.com/navigator/npm/figlet?source=infosec-jobs.com&utm_term=&utm_campaign=&utm_source=google&utm_medium=cpc&hsa_acc=2785245595&hsa_cam=20960539431&hsa_grp=&hsa_ad=&hsa_src=x&hsa_tgt=&hsa_kw=&hsa_mt=&hsa_net=adwords&hsa_ver=3&gad_source=2&gclid=CjwKCAiA0PuuBhBsEiwAS7fsNWWi1hbv-sETlRUKu6WEwwsq3gBUYMxYA7ixmYlnZNLH4yIsyquGshoCl_YQAvD_BwE)

Figlet Art Generator: [askapache.com](https://www.askapache.com/online-tools/figlet-ascii/)

DESCRIBE query in mysql for debugging: [dev.mysql.com](https://https://dev.mysql.com/doc/refman/8.0/en/describe.html)

# Deployment

GitHub Repository Link [Click Here!](https://)