const bcrypt = require('bcrypt');

exports.encryption= async (password)=>{
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword
}