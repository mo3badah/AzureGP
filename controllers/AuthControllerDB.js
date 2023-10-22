const Client = require("../models/client")
const bcrypt = require("bcrypt")
const {userToken} = require("../config/jwt");
const {AUTH_MAX_AGE} = process.env;
let login = async (req, res) =>{
    try{
        // check email
        let user = await Client.findOne({where :{email: req.body.email}})
        if (!user) return  res.status(401).json({ error:"Invalid Email or Password please try again"})
        // check password
        const validPswd = await bcrypt.compare(req.body.password, user.password)
        if (!validPswd) return  res.status(401).json({ error:"Invalid Email or Password..."})
        let payload = {
            id: user.id,
            fullName: user.fullName,
            email: user.email
        }
        const token = await userToken(payload);
        payload.token=token
        res.cookie('token', token, {
            httpOnly: false,
            maxAge: AUTH_MAX_AGE,
        });
        res.status(200).send(payload);
    }catch(error) {
        return res.status(400).json({ error: error });
    }
}
module.exports = {
    login
}
