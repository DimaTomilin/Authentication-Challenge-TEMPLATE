const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { encryption } = require('../helpers/bcrypt');
const { generateAccessToken } = require('../helpers/generateToken');

const USERS = [
  {
    email: 'admin@email.com',
    name: 'admin',
    password: '$2b$10$KtkEC/cbvQmpctuRTlZxA.8eoORm7vVmdxSG1GqnwW.wJ9uvQOTQu',
    isAdmin: true,
  },
];
const INFORMATION = [{ email: 'admin@email.com', info: 'admin info' }];
let REFRESHTOKENS = [];

exports.registrationUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (USERS.find((user) => user.name === req.body.user)) {
      return res.status(409).send('user already exists');
    }
    const hashedPassword = await encryption(password);
    const newUser = { email, name, password: hashedPassword, isAdmin: false };
    USERS.push(newUser);
    INFORMATION.push({ email: email, info: `${name} info` });
    res.status(201).send('Register Success');
  } catch {
    res.status(500).send('Server error');
  }
};

exports.userLogin = async (req, res) => {
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
          accessToken,
          refreshToken,
          email,
          name: currentUser.name,
          isAdmin: currentUser.isAdmin,
        });
      } else return res.status(403).send('User or Password incorrect');
    } else return res.status(404).send('cannot find user');
  } catch {
    res.status(500).send('Server error');
  }
};

exports.userLogout = async (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(400).send('Refresh Token Required');
  }
  if (!REFRESHTOKENS.find((token) => token === refreshToken)) {
    return res.status(400).send('Invalid Refresh Token');
  }
  REFRESHTOKENS = REFRESHTOKENS.filter((token) => token !== req.body.token);
  res.status(200).send('User Logged Out Successfully');
};

exports.checkToken = (req, res) => {
  const user = req.user;
  if (user) return res.send({ valid: true });
};

exports.getInformation = (req, res) => {
  const { email } = req.user;
  const info = INFORMATION.find((file) => file.email === email).info;
  res.send([{ email }, { info }]);
};

exports.getAllUsers = (req, res) => {
  const { email } = req.user;
  const user = USERS.find((file) => file.email === email);
  if (!user.isAdmin) {
    return res.status(403).send('Invalid Access Token');
  }
  res.send({ users: USERS });
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null)
    return res.status(401).send('Refresh Token Required');
  if (!REFRESHTOKENS.includes(refreshToken))
    return res.status(403).send('Invalid Refresh Token');
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, { email, password }) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({
        email,
        password,
      });
      res.json({ accessToken: accessToken });
    }
  );
};

exports.allOptions = (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.send(['/users/register', '/users/login']);
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.send(['/users/register', '/users/login', '/users/token']);
    }
    const currentUser = USERS.find((file) => file.email === user.email);
    if (currentUser.isAdmin) {
      return res.send([
        '/users/register',
        '/users/login',
        '/users/token',
        '/users/tokenValidate',
        '/users/logout',
        '/api/v1/information',
        '/api/v1/users',
      ]);
    } else {
      return res.send([
        '/users/register',
        '/users/login',
        '/users/token',
        '/users/tokenValidate',
        '/users/logout',
        '/api/v1/information',
      ]);
    }
  });
};
