const express = require("express");
const app = express();
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const {encryption} = require('./helpers/bcrypt')
const {registrationUser} = require("./controlers/Users")

const {
    errorHandlerMiddleware,
    unknownEndpoint,
  } = require('./middleware/errorHandler');

const USERS = [{ email: "admin@email.com", name: "admin", password: "$2b$10$KtkEC/cbvQmpctuRTlZxA.8eoORm7vVmdxSG1GqnwW.wJ9uvQOTQu", isAdmin: true }]
const INFORMATION = [{email:"1111", info:"23213"}]
const REFRESHTOKENS = []

app.use(express.json());

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(' :method :url :status :res[content-length] - :response-time ms :body')
);

app.post("/users/register", registrationUser)
app.use(express.static("client/build"));

app.use(unknownEndpoint);
app.use(errorHandlerMiddleware);

module.exports = {USERS};
module.exports = app;
