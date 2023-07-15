const validator = require("../util/reserveFlights")

module.exports = async (req, res, nxt) => {
    let valid = validator(req.body)
    if (valid) {
        req.vlaid = 1
        nxt()
    } else {
        res.status(403).send("Forbidden command... \n please review that your structure is valid.")
    }
}
