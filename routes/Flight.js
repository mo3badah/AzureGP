const express = require("express")
const router = express.Router()
const flight = require("../controllers/FlightControllerDB")
const validatorMW = require("../middlewares/FlightValidatorMV")
const validatorsMW = require("../middlewares/FlightsValidatorMW")
// login authentication
router.post("/",validatorMW, flight.postNewFlight)
router.post("/bulk",validatorsMW, flight.postNewFlights)
router.get("/", flight.getAllFlights)
router.get("/from-to", flight.getFlightFromTo)
router.get("/from-to-date", flight.getFlightFromToDate)
router.get("/flight-seats", flight.getFlightSeats)

module.exports = router

