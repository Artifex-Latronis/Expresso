const express = require('express');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const apiRouter = require('./api/api.js');

const app = express();
const PORT = process.env.PORT || 4000;

if (process.env.TEST_DATABASE) {
  app.use(morgan('dev'));
};

//add comment here for git testing

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

module.exports = app;