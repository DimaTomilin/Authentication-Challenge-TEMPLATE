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

const USERS = [{ email: "admin@email.com", name: "admin", password: "$2b$10$KtkEC/cbvQmpctuRTlZxA.8eoORm7vVmdxSG1GqnwW.wJ9uvQOTQu", isAdmin: true },]
const INFORMATION = [{email:"1111", info:"23213"}]
const REFRESHTOKENS = []

app.use(express.json());

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(' :method :url :status :res[content-length] - :response-time ms :body')
);

app.post("/users/register", async (req, res) => {
    try{
        const {email,user,password} = req.body
        if(USERS.find(user => user.name===req.body.user)){
            return res.status(409).send("user already exists")
        }
        const hashedPassword = await encryption(password)
        const newUser = { email, name: user, password: hashedPassword, isAdmin: false }
        USERS.push(newUser)
        INFORMATION.push({email, info:`${user} info`})
        res.status(201).send("Register Success")
    } catch {
        res.status(500).send("Server error")
    }  
})

app.use(express.static("client/build"));

app.use(unknownEndpoint);
app.use(errorHandlerMiddleware);

module.exports = {USERS};
module.exports = app;
