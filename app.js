const express = require('express');
const app = express();
const morgan = require('morgan');

const {
  registrationUser,
  userLogin,
  userLogout,
  checkToken,
  getInformation,
  getAllUsers,
  refreshToken,
  allOptions,
} = require('./controlers/Users');

const {
  errorHandlerMiddleware,
  unknownEndpoint,
} = require('./middleware/errorHandler');
const { authToken } = require('./middleware/tokenValidation');

app.use(express.json());

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(' :method :url :status :res[content-length] - :response-time ms :body')
);

//Registration
app.post('/users/register', registrationUser);

//Login
app.post('/users/login', userLogin);

//Logout
app.post('/users/logout', userLogout);

//Check token
app.post('/users/tokenValidate', authToken, checkToken);

//Get user information, using autorization middleware
app.get('/api/v1/information', authToken, getInformation);

//Get information about all users(only to admin), using autorization middleware
app.get('/api/v1/users', authToken, getAllUsers);

//Refresh token
app.post('/users/token', refreshToken);

//Get all API`s that user can use
app.options('/', allOptions);

app.use(express.static('client/build'));

app.use(unknownEndpoint);
app.use(errorHandlerMiddleware);

module.exports = app;
