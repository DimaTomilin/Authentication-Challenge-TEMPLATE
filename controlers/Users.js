
const {encryption} = require('../helpers/bcrypt')

exports.registrationUser = async (req, res) => {
    const {email,user,password} = req.body
    const hashedPassword = await encryption(password)
    const newUser = { email, name: user, password: hashedPassword, isAdmin: false }
   
    //USERS.push(newUser)

    res.status(201).send("Register Success")
  };