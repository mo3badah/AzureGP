const express = require("express")
const router = express.Router()
const flight = require("../controllers/FlightControllerDB")
const validatorMW = require("../middlewares/FlightValidatorMV")
const validatorsMW = require("../middlewares/FlightsValidatorMW")
// login authentication
router.post("/",validatorMW, flight.postNewFlight)
router.post("/bulk",validatorsMW, flight.postNewFlights)
router.get("/", flight.getAllFlights)
router.post("/from-to", flight.getFlightFromTo)
router.post("/from-to-date", flight.getFlightFromToDate)
router.post("/from-to-date-class-no", flight.getFlightFromToDateClassNo)
router.post("/from-to-elastic-date-class-no", flight.getFlightFromToElasticDateClassNo)
router.post("/flight-seats", flight.getFlightSeats)
router.post("/reserve-seats", flight.reserveSeats)
router.post("/ticket-details", flight.getTicketDetailsByTicketNumber)
router.post("/tickets-with-linked-users", flight.getAllTicketsLinkedData)
router.post("/get-ticket", flight.searchByTicketNo)

module.exports = router

