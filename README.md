# 12-build-a-database
SQL Challenge: Employee Tracker

# Live Demo Video


# Getting Started

1. Clone gitHub repository
2. NPM Install
3. Use command node index.js


# User Story

AS A business owner

I WANT to be able to view and manage the departments, roles, and employees in my company

SO THAT I can help plan for growth and organize employee data

# Acceptance Criteria

GIVEN a command-line application that accepts user input

WHEN I start the application

THEN I am presented with a figlet message "Success!"

THEN I am presented with the following options: ? Are you viewing your database or making an entry? 

WHEN I choose to view 

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

WHEN I choose to make an entry

THEN I am presented with: ? Are you entering a new department? (Y/N)

WHEN I choose no the line of questions and input continues

WHEN I choose yes 

THEN I am presented with ? Enter the new department name

WHEN I enter the deparment name i am presented with Inserted new department: Janitorial Services with ID: 11
Successful department entry!

THEN I am presented with: ? Are you entering a new role? (Y/N)

WHEN I choose no the line of questioning will continue

WHEN I choose yes 

THEN I am presented with ? Enter the new role name:

WHEN I enter the new role name

THEN I am presented with ? Enter the new role salary:

WHEN I enter the salary

THEN I am presetned with: ? Enter the department ID for the new role:

THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database

WHEN I choose to update an employee role

THEN I am prompted to select an employee to update and their new role and this information is updated in the database

# References 

Bootcamp Spot MySQL2 for node.js

Referenced code from Project 2-Dungeons & Devs: [GitHub Link](https://github.com/Maximilian93B/DungeonsAndDevs.git), Challenge 9 and Challenge 10

Tutor Samuel Cordova-Help with file structre and connection to employee_db

Figet Installation: [Cloudsmith.com](https://cloudsmith.com/navigator/npm/figlet?source=infosec-jobs.com&utm_term=&utm_campaign=&utm_source=google&utm_medium=cpc&hsa_acc=2785245595&hsa_cam=20960539431&hsa_grp=&hsa_ad=&hsa_src=x&hsa_tgt=&hsa_kw=&hsa_mt=&hsa_net=adwords&hsa_ver=3&gad_source=2&gclid=CjwKCAiA0PuuBhBsEiwAS7fsNWWi1hbv-sETlRUKu6WEwwsq3gBUYMxYA7ixmYlnZNLH4yIsyquGshoCl_YQAvD_BwE)

Figlet Art Generator: [askapache.com](https://www.askapache.com/online-tools/figlet-ascii/)

# Deployment

GitHub Repository Link [Click Here!](https://)