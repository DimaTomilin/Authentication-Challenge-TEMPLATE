const bcrypt = require('bcrypt');

exports.encryption= async (password)=>{
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    return hashedPassword
}