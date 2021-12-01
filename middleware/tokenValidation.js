const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader.split(' ')[1] === null || !authHeader)
    return res.status(401).send('Access Token Required');

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Access Token');
    req.user = user;
    next();
  });
};
