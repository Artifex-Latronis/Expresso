const testUtilities = require('../testUtilities.js');
const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets.js');

const pgm = 'employees.js';

//resolve 'employeeId'
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
  const values = {
    $employeeId: employeeId
  };

  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.status(404).send();
    }
  });
});

//Reroute 'timesheets' requests
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

//GET /api/employees
employeesRouter.get('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const sql = `SELECT * FROM Employee WHERE is_current_employee = 1`;
  db.all(sql, (error, employees) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        employees: employees
      });
    }
  });
});

//POST /api/employees
employeesRouter.post('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    return res.status(400).send();
  }
  const sql = `INSERT INTO Employee (
    name,
    position,
    wage,
    is_current_employee
  ) VALUES (
    $name,
    $position,
    $wage,
    $isCurrentEmployee
  )`
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (error, employee) => {
        res.status(201).json({
          employee: employee
        });
      });
    }
  });
});

//GET /api/employees/:employeeId
employeesRouter.get('/:employeeId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  res.status(200).json({
    employee: req.employee
  });
});

//PUT /api/employees/:employeeId
employeesRouter.put('/:employeeId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    return res.status(400).send();
  }

  const sql = `UPDATE Employee SET
    name = $name,
    position = $position,
    wage = $wage,
    is_current_employee = $isCurrentEmployee
    WHERE Employee.id = $employeeId`;
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (error, employee) => {
        res.status(200).json({
          employee: employee
        });
      });
    }
  });
});

//DELETE api/employees/:employeeId
employeesRouter.delete('/:employeeId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const sql = `UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId`;
  const values = {
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (error, employee) => {
        res.status(200).json({
          employee: employee
        });
      });
    }
  });
});

//Export the router
module.exports = employeesRouter;