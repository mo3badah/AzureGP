const express = require("express")
const router = express.Router()
const validator = require("../middlewares/UsersValidatorMW")
const updateValidator = require("../middlewares/UpdateClientValidatorMW")
const userBulkValidator = require("../middlewares/UsersBulkValidator")
const {postNewClient, getAllClients, addNewClientFromAdmin,addMultipleClients, editNewClient, updateToClient, deleteClient, getSpecificClient} = require("../controllers/UsersControllerDB");
const { authenticateUser, authorizeUser} = require('../controllers/authentication');
const idValidator = require("../middlewares/IdValidator");

router.post("/",validator,postNewClient)
router.get("/", getAllClients)
router.post("/mine", getSpecificClient)
router.post("/editNewUser", updateValidator, editNewClient)
router.post("/addNewClientFromAdmin",validator,addNewClientFromAdmin)
router.post("/addMultipleClients",userBulkValidator, addMultipleClients)
// router.post("/updateToClient",updateToClient)
router.delete("/deleteClient",idValidator,deleteClient)

module.exports = router
