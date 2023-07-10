const Client = require("../models/client")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
let login = async (req, res) =>{
    try{
        // check email
        let user = await Client.findOne({where :{email: req.body.email}})
        if (!user) return  res.status(400).send("Invalid Email or Password please try again")
        // check password
        const validPswd = await bcrypt.compare(req.body.password, user.password)
        if (!validPswd) return  res.status(400).send("Invalid Email or Password...")
        const token = jwt.sign({userId: `${user.id}`}, "myJsonWebTokenSecretKeyIsHere")
        // send response
        res.header("x-auth-token", token)
        const query = {
            "name": user.fullName,
            "id": user.id
        }
        for (let propName in query) {
            res.cookie(propName, query[propName],2*24*60*60)
        }
        res.status(200).send(
            token
            // `The user ${user.fullName} signed in successfully.`
        )
    }catch (e) {
        console.log("there is some errors on the config file configuration :"+e)
    }
}
module.exports = {
    login
}
