//Utility to output the req object while testing
const reqConsoleOutput = (pgm, req) => {
  if (process.env.TEST_DATABASE) {
    console.log(``);
    console.log(`pgm - ${pgm}`);
    console.log(`req.body - ${JSON.stringify(req.body)}`);
    console.log(`req.params - ${JSON.stringify(req.params)}`);
    if (req.employee) {
      console.log(`req.employee - ${JSON.stringify(req.employee)}`);
    }
    if (req.timesheet) {
      console.log(`req.timesheet - ${JSON.stringify(req.timesheet)}`);
    }
    if (req.menu) {
      console.log(`req.menu - ${JSON.stringify(req.menu)}`);
    }
    if (req.menuItem) {
      console.log(`req.menuItem - ${JSON.stringify(req.menuItem)}`);
    }
  }
};

exports.reqConsoleOutput = reqConsoleOutput;

// some new notes

// some more new notes

// added notes for dev branch