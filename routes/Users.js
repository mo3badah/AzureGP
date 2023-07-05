const express = require("express")
const router = express.Router()
const validator = require("../middlewares/UsersValidatorMW")
const updateValidator = require("../middlewares/UpdateClientValidatorMW")
const userBulkValidator = require("../middlewares/UsersBulkValidator")
const {postNewClient, getAllClients, addNewClientFromAdmin,addMultipleClients, editNewClient, updateToClient, deleteClient} = require("../controllers/UsersControllerDB");

// Registration route handler
// 1. we get the route to make a new user
// 2. we check validation of the data which sent to us from the form and try to make it ready
router.post("/",validator,postNewClient)
router.get("/",getAllClients)
router.post("/editNewUser", updateValidator, editNewClient)
router.post("/addNewClientFromAdmin",validator,addNewClientFromAdmin)
router.post("/addMultipleClients",userBulkValidator, addMultipleClients)
// router.post("/updateToClient",updateToClient)
// router.delete("/deleteClient/:email",deleteClient)

module.exports = router
