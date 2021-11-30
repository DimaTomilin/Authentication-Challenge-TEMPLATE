const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = "e49Zg5EbSMu4VEH2vY4d0rQQVLwfFTlgpMOorihVZ0fDhXmcthTDsC2lY58A95uQuxGsHkivo7k02oq3"

exports.generateAccessToken=(user)=> {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
  }