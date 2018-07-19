const testUtilities = require('../testUtilities.js');
const express = require('express');
const timesheetsRouter = express.Router({
  mergeParams: true
});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const pgm = 'timesheets.js';

//resolve 'timesheetId'
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = `SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  const values = {
    $timesheetId: timesheetId
  };

  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.status(404).send();
    }
  });
});

//GET api/employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const sql = `SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`;
  const values = {
    $employeeId: req.params.employeeId
  };
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        timesheets: timesheets
      });
    }
  });
});

//POST /api/employees/:employeeId/timesheets
timesheetsRouter.post('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  const employeeSql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
  const employeeValues = {
    $employeeId: employeeId
  };

  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date || !employee) {
        return res.status(400).send();
      }
    }

    const timesheetSql = `INSERT INTO Timesheet (
      hours,
      rate,
      date,
      employee_id
    ) VALUES (
      $hours,
      $rate,
      $date,
      $employeeId
    )`;

    const timesheetValues = {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId
    };

    db.run(timesheetSql, timesheetValues, function(error) {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (error, timesheet) => {
          res.status(201).json({
            timesheet: timesheet
          });
        });
      }
    });
  });
});

//PUT /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  const employeeSql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
  const employeeValues = {
    $employeeId: employeeId
  };

  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date || !employee) {
        return res.status(400).send();
      }
    }

    const timesheetSql = `UPDATE Timesheet SET
      hours = $hours,
      rate = $rate,
      date = $date,
      employee_id = $employeeId
      WHERE Timesheet.id = $timesheetId`;

    const timesheetValues = {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId,
      $timesheetId: req.params.timesheetId
    };

    db.run(timesheetSql, timesheetValues, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (error, timesheet) => {
          res.status(200).json({
            timesheet: timesheet
          });
        });
      }
    });
  });
});

//DELETE /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const sql = `DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId`;
  const values = {
    $timesheetId: req.params.timesheetId
  }

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.status(204).send();
    }
  });
});

//Export the router
module.exports = timesheetsRouter;