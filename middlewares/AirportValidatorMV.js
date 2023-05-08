const validator = require("../util/AirportValidator")

module.exports = (req,res,nxt)=>{
    let valid = validator(req.body)
    if (valid){
        nxt()
    }else {
        res.status(403).send("Forbidden command")
    }
}
