const express = require("express")
const router = express.Router()
const validator = require("../middlewares/UsersValidatorMW")
const updateValidator = require("../middlewares/UpdateClientValidatorMW")
const userBulkValidator = require("../middlewares/UsersBulkValidator")
const {postNewClient, getAllClients, addNewClientFromAdmin,addMultipleClients, editNewClient, updateToClient, deleteClient, getSpecificClient} = require("../controllers/UsersControllerDB");
const { authenticateUser, authorizeUser} = require('../controllers/authentication');

router.post("/",validator,postNewClient)
router.get("/",authenticateUser, authorizeUser(['admin']), getAllClients)
router.get("/mine",authenticateUser, getSpecificClient)
router.post("/editNewUser", updateValidator, editNewClient)
router.post("/addNewClientFromAdmin",validator,addNewClientFromAdmin)
router.post("/addMultipleClients",userBulkValidator, addMultipleClients)
// router.post("/updateToClient",updateToClient)
// router.delete("/deleteClient/:email",deleteClient)

module.exports = router
