// import user model of db
const Flight = require("../models/flight");
const Airport = require("../models/airport");
const FlightAirport = require("../models/FlightAirports");
const sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const { json } = require("express");
const Airline = require("../models/airline");
const Stops = require("../models/stops");
const Types = require("../models/type");
const ClassDetails = require("../models/class_details");
const Seats = require("../models/seats");
const Ticket = require("../models/ticket");
const { all } = require("express/lib/application");
// let flight_number = require("../util/flightNameGen");

async function createNewFlight(flight) {
  // create flight number from module ==> util/flightNameGen.js
  let prefix = Math.floor(Math.random() * 100) + 1; // Generate a random prefix between 1 and 100
  let suffix = Math.random().toString(36).substring(3, 6).toUpperCase(); // Generate a random alphanumeric suffix
  let flight_number = `${prefix}${suffix}`;
  // create flight stops
  let stops = flight.stops;
  let noOfStops = stops.length;
  // get class details
  let class_details = flight.class_details;
  let newFlight = await Flight.create({
    flight_number: flight_number,
    take_off_time: flight.take_off_time,
    take_off_date: flight.take_off_date,
    status: flight.status,
    duration: flight.duration,
    no_of_stops: noOfStops,
  });
  // get the type of the flight
  let type = await Types.findOne({
    where: { flight_type: flight.type },
  });
  if (!type) {
    type = {
      no_of_first_class_seats: 12,
      no_of_economical_seats: 24,
      no_of_business_seats: 144,
    };
  } else {
    type.addFlight(newFlight);
  }
  if (noOfStops > 0) {
    stops.forEach(async (stop) => {
      let airport = await Airport.findOne({
        where: { AP_name: stop.airport_name },
      });
      let newStop = await Stops.create({
        date: stop.date,
        time: stop.time,
        airport_id: airport.AP_id,
        duration: stop.duration,
      });
      newFlight.addStops(newStop);
    });
  }
  // create seats
  let no_of_economical_seats = type.no_of_economical_seats;
  let no_of_business_seats = type.no_of_business_seats;
  let no_of_first_class_seats = type.no_of_first_class_seats;
  let businessSeats = generateBusinessSeats(no_of_business_seats);
  let economiSeats = generateEconomiSeats(no_of_economical_seats);
  let firstClassSeats = generateFirstClassSeats(no_of_first_class_seats);
  // create classes
  if (class_details.length > 0) {
    class_details.forEach(async (class_detail) => {
      let newClasses = await ClassDetails.create({
        class: class_detail.class,
        price: class_detail.price,
        weight_limit: class_detail.weight_limit,
        extra_luggage_price: class_detail.extra_luggage_price,
      });
      newFlight.addClass_details(newClasses);
      switch (class_detail.class) {
        case "business":
          newClasses.available_seats = no_of_business_seats;
          businessSeats.forEach(async (seat) => {
            let newSeat = await Seats.create({
              seat_no: seat,
            });
            newClasses.addSeats(newSeat);
          });
          break;
        case "economy":
          newClasses.available_seats = no_of_economical_seats;
          economiSeats.forEach(async (seat) => {
            let newSeat = await Seats.create({
              seat_no: seat,
            });
            newClasses.addSeats(newSeat);
          });
          break;
        default:
          newClasses.available_seats = no_of_first_class_seats;
          firstClassSeats.forEach(async (seat) => {
            let newSeat = await Seats.create({
              seat_no: seat,
            });
            newClasses.addSeats(newSeat);
          });
          break;
      }
    });
  }
  // get all the airports from the request
  let airportFrom = await Airport.findOne({
    where: { AP_name: flight.airportFrom },
  });
  let airportTo = await findAirportId(flight.airportTo);

  let airline_id = await Airline.findOne({
    where: { AL_name: flight.airline_name },
  });
  // Add the airports to the flight record
  await airline_id.addFlight(newFlight);
  await newFlight.addAirport(airportFrom, {
    through: { airportTo: airportTo.AP_id },
  });
}
let updateFlight = async (req, res) => {};
let postNewFlight = async (req, res) => {
  try {
    let flight = req.body;
    await createNewFlight(flight);
    res.status(200).send("Flight has been created successfully");
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad Request...");
  }
};
let postNewFlights = async (req, res) => {
  try {
    let FlightsData = req.body; // Assuming the request body contains an array of flights
    // Create and save the new flights
    FlightsData.forEach(async (flight) => await createNewFlight(flight));
    // Send success response
    res.status(200).send("Flights have been created successfully");
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad Request...");
  }
};
let getAllFlights = async (req, res) => {
  try {
    let flights = await Flight.findAll({
      exclude: ["createdAt", "updatedAt"],
      include: [
        { model: Airline },
        { model: Airport },
        { model: ClassDetails },
      ],
    });
    // return res.send(flights);
    if (!flights) return res.status(404).send("Flights data are not found...");
    let flightsData = await finalView(flights);
    res.send(flightsData);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("Flights data are not found...");
  }
};
let getFlightFromTo = async (req, res) => {
  try {
    let airportFromId = await findAirportId(req.body.airportFrom);
    let airportToId = await findAirportId(req.body.airportTo);
    let flights = await FlightAirport.findAll({
      where: { airportFrom: airportFromId.AP_id, airportTo: airportToId.AP_id },
      attributes: ["flightId"],
    });
    let flightsData = [];
    flights.forEach(async (flight) => {
      flightsData.push(flight.flightId);
    });
    if (!flightsData)
      return res.status(404).send("Flights data are not found...");
    let flightsAllData = await getAllFlightsWithIds(flightsData);
    res.send(flightsAllData);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("Flights data are not found...");
  }
};
let getFlightFromToDate = async (req, res) => {
  try {
    let airportFromId = await findAirportId(req.body.airportFrom);
    let airportToId = await findAirportId(req.body.airportTo);
    let flights = await FlightAirport.findAll({
      where: { airportFrom: airportFromId.AP_id, airportTo: airportToId.AP_id },
      attributes: ["flightId"],
    });
    let flightsData = [];
    flights.forEach(async (flight) => {
      flightsData.push(flight.flightId);
    });
    if (!flightsData)
      return res.status(404).send("Flights data are not found...");
    let flightsAllData = await getAllFlightsWithIdsWithDate(
      flightsData,
      req.body.date
    );
    res.send(flightsAllData);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("Flights data are not found...");
  }
};
let getFlightSeats = async (req, res) => {
  flightId = req.body.id;
  let classes = await ClassDetails.findAll({
    attributes: ["class", "available_seats", "price"],
    where: {
      flightId: flightId,
    },
    include: [
      {
        model: Seats,
        where: {
          ticketTicketNumber: null,
        },
        attributes: ["seat_no", "id"],
      },
    ],
    order: [[{ model: Seats, as: "seat" }, "seat_no", "ASC"]],
  });
  if (!classes) res.status(404).send("Flight with this ID is not found...");
  res.status(200).send(classes);
};
// Reserve number of seats in a flight to a specific users
let reserveSeats = async (req, res) => {
  let seats = req.body.seats;
  let users = req.body.users;
  // Check if no of seats are equal to users
  if (seats.length !== users.length) {
    return res.status(400).send("Number of seats and users are not equal");
  }
  // get class id and seat id
  let ticketNumber = await generateTicketNumber();
  let seatIds = [];
  let seatsData = await Seats.findAll({
    where: {
      seat_no: seats,
      classDetailsId: classId,
      ticketTicketNumber: null,
    },
  });
  seatsData.forEach(async (seat) => {
    seatIds.push(seat.id);
  });
  let ticket = await Ticket.create({
    ticketNumber: ticketNumber,
    userId: userId,
    classDetailsId: classId,
  });
  await ticket.addSeats(seatIds);
  res.status(200).send("Seats have been reserved successfully");
};
async function generateTicketNumber(seat, user) {
  // check seat is available
  let seatData = await Seats.findOne({
    where: {
      id: seat
    },
    include: [
      {
        model: ClassDetails,
        attributes: ["class_details_id"],
        include: [
          {
            model: Flight,
            attributes: ["id"],
          },
        ],
      },
    ],
  });
  if (!seatData) return "Seat is not found...";
  if (seatData.ticketTicketNumber !== null) return "Seat is not available...";
  // check user is available
  let userData = await Client.findOne({
    where: {
      id: user,
    },
  });
  if (!userData) return "User is not found...";
  // generate ticket number
  let classId = seatData.classDetails.class_details_id;
  let flightId = seatData.classDetails.flight.id;
  // get instance of class and flight
    let classData = await ClassDetails.findOne({
        where: {
            class_details_id: classId,
        }
    }
    );
    let flightData = await Flight.findOne({
        where: {
            id: flightId,
        }
    }
    );
    // generate ticket
    let newTicket = await Ticket.create({});
    // add ticket to user
    await userData.addTicket(newTicket);
    // add ticket to seat
    await seatData.setTicket(newTicket);
    // add ticket to class
    await classData.addTicket(newTicket);
    // add ticket to flight
    await flightData.addTicket(newTicket);
    // return ticket number
    return await getTicketData(newTicket.id);
}
// get ticket data
async function getTicketData(ticketId) {
    let ticketData = await Ticket.findOne({
        where: {
        id: ticketId,
        },
        attributes: ["ticketNumber"],
        include: [
        {
            model: Seats,
            attributes: ["seat_no"],
        },
        {
            model: ClassDetails,
            attributes: ["class","price"],
        },
        {
            model: Flight,
            attributes: ["flight_number", "take_off_time", "take_off_date","duration","no_of_stops"],
        },
        {
            model: Client,
            attributes: ["fullName"],
        },
        ],
    });
    return ticketData;
}
// generate business seats
function generateBusinessSeats(numSeats) {
  const seatLetters = ["A", "B", "C", "D"]; // Letters representing seat rows
  const seatsPerRow = Math.ceil(numSeats / seatLetters.length); // Number of seats per row

  let seats = [];
  let currentIndex = 1;

  for (let i = 0; i < numSeats; i++) {
    const letterIndex = i % seatLetters.length;
    const row = currentIndex + seatLetters[letterIndex];

    if (seats.includes(row)) {
      currentIndex++; // If the seat is already assigned, increment the index to the next row
      i--; // Decrement i to repeat the current iteration with the updated index
      continue;
    }

    seats.push(row);

    // Increment the index for every seatsPerRow iterations
    if ((i + 1) % seatsPerRow === 0) {
      currentIndex++;
    }
  }

  return seats;
}

function generateEconomiSeats(numSeats) {
  const seatLetters = ["A", "B", "C", "D", "E", "F"]; // Letters representing seat rows
  const seatsPerRow = Math.ceil(numSeats / seatLetters.length); // Number of seats per row

  let seats = [];
  let currentIndex = 1;

  for (let i = 0; i < numSeats; i++) {
    const letterIndex = i % seatLetters.length;
    const row = currentIndex + seatLetters[letterIndex];

    if (seats.includes(row)) {
      currentIndex++; // If the seat is already assigned, increment the index to the next row
      i--; // Decrement i to repeat the current iteration with the updated index
      continue;
    }

    seats.push(row);

    // Increment the index for every seatsPerRow iterations
    if ((i + 1) % seatsPerRow === 0) {
      currentIndex++;
    }
  }

  return seats;
}
// final view of flights
async function finalView(flights) {
  flights = flights.map(async (flight) => {
    let airportTo = await Airport.findOne({
      attributes: ["AP_name"],
      where: { AP_id: flight["airports"][0]["flightAirports"]["airportTo"] },
    });
    return {
      flight_number: flight.flight_number,
      take_off_time: flight.take_off_time,
      take_off_date: flight.take_off_date,
      status: flight.status,
      duration: flight.duration,
      no_of_stops: flight.no_of_stops,
      airline_name: flight.airline.AL_name,
      airportFrom: flight.airports[0].AP_name,
      airportTo: airportTo.AP_name,
      classes: flight.class_details.map((class_detail) => {
        return {
          class_type: class_detail.class,
          price: class_detail.price,
          seats: class_detail.available_seats,
        };
      }),
    };
  });
  return await Promise.all(flights);
}
async function findAirportId(name) {
  return await Airport.findOne({
    where: { AP_name: name },
    attributes: ["AP_id"],
  });
}
async function getAllFlightsWithIds(ids) {
  try {
    let flights = await Flight.findAll({
      where: {
        id: {
          [sequelize.Op.in]: ids,
        },
      },
      exclude: ["createdAt", "updatedAt"],
      include: [
        { model: Airline },
        { model: Airport },
        { model: ClassDetails },
      ],
    });
    // return res.send(flights);
    if (!flights) return res.status(404).send("Flights data are not found...");
    return await finalView(flights);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    return "Flights data are not found...";
  }
}
async function getAllFlightsWithIdsWithDate(ids, date) {
  try {
    let dat = new Date(date);
    let flights = await Flight.findAll({
      where: {
        id: {
          [sequelize.Op.in]: ids,
        },
        take_off_date: {
          [sequelize.Op.gte]: dat,
        },
      },
      exclude: ["createdAt", "updatedAt"],
      include: [
        { model: Airline },
        { model: Airport },
        { model: ClassDetails },
      ],
    });
    // return res.send(flights);
    if (!flights) return res.status(404).send("Flights data are not found...");
    return await finalView(flights);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    return "Flights data are not found...";
  }
}
module.exports = {
  postNewFlight,
  postNewFlights,
  getAllFlights,
  getFlightFromTo,
  getFlightFromToDate,
  getFlightSeats,
};
