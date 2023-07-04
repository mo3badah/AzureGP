const validator = require("../util/UserValidator")

let postNewUsers = async (req, res, nxt) => {
    try {
        let BulkUsers = req.body;
        let notCompatibleUsers = [];
        for (let i = 0; i < BulkUsers.length; i++) {
            let user = BulkUsers[i];
            let valid = validator(user);
            if (!valid) {
                notCompatibleUsers.push(user);
            }
        }
        if (notCompatibleUsers.length > 0) {
            return res.status(400).send(notCompatibleUsers);
        }
        nxt()
    } catch (e) {
        console.log(e);
        res.status(400).send('not compatible users data...');
    }
};

module.exports = postNewUsers;