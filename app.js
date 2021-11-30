const express = require('express');
const app = express();
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { encryption } = require('./helpers/bcrypt');

const { generateAccessToken } = require('./helpers/generateToken');
const { registrationUser } = require('./controlers/Users');

const {
  errorHandlerMiddleware,
  unknownEndpoint,
} = require('./middleware/errorHandler');

const USERS = [
  {
    email: 'admin@email.com',
    name: 'admin',
    password: '$2b$10$KtkEC/cbvQmpctuRTlZxA.8eoORm7vVmdxSG1GqnwW.wJ9uvQOTQu',
    isAdmin: true,
  },
];
const INFORMATION = [{ email: '1111', info: '23213' }];
let REFRESHTOKENS = [];

app.use(express.json());

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(' :method :url :status :res[content-length] - :response-time ms :body')
);

//Registration
app.post('/users/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (USERS.find((user) => user.name === req.body.user)) {
      return res.status(409).send('user already exists');
    }
    const hashedPassword = await encryption(password);
    const newUser = { email, name, password: hashedPassword, isAdmin: false };
    USERS.push(newUser);
    INFORMATION.push({ email, info: `${name} info` });
    res.status(201).send('Register Success');
  } catch {
    res.status(500).send('Server error');
  }
});

//Login
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const currentUser = USERS.find((user) => user.email === email);
    if (currentUser) {
      const correctPassword = await bcrypt.compare(
        password,
        currentUser.password
      );
      if (correctPassword) {
        const accessToken = generateAccessToken(req.body);
        const refreshToken = jwt.sign(
          req.body,
          process.env.REFRESH_TOKEN_SECRET
        );
        REFRESHTOKENS.push(refreshToken);
        res.json({
          accessToken: accessToken,
          refreshToken: refreshToken,
          email: email,
          name: currentUser.name,
          isAdmin: currentUser.isAdmin,
        });
      } else return res.status(403).send('User or Password incorrect');
    } else return res.status(404).send('cannot find user');
  } catch {
    res.status(500).send('Server error');
  }
});

//Logout
app.post('/users/logout', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(400).send('Refresh Token Required');
  }
  if (!REFRESHTOKENS.find((token) => token === refreshToken)) {
    return res.status(400).send('Invalid Refresh Token');
  }
  REFRESHTOKENS = REFRESHTOKENS.filter((token) => token !== req.body.token);
  res.status(200).send('User Logged Out Successfully');
});


app.post('/users/token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null)
    return res.status(401).send('Refresh Token Required');
  if (!REFRESHTOKENS.includes(refreshToken))
    return res.status(403).send('Invalid Refresh Token');
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(user);
    res.json({ accessToken: accessToken });
  });
});

app.use(express.static('client/build'));

app.use(unknownEndpoint);
app.use(errorHandlerMiddleware);

module.exports = app;
