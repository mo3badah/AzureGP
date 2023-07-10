// import user model of db
const Flight = require("../models/flight");
const Airport = require("../models/airport");
const FlightAirport = require("../models/FlightAirports");
const sequelize = require("../models/sequelize");
const { Op } = require('sequelize');
const jwt = require("jsonwebtoken");
const { json } = require("express");
const Airline = require("../models/airline");
const Stops = require("../models/stops");
const Types = require("../models/type");
const ClassDetails = require("../models/class_details");
const Seats = require("../models/seats");
const Ticket = require("../models/ticket");
const Client = require("../models/client");
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
// to make a flight auto generated every specific time
// get the flight data from DB
let getFlightData = async (name) => {
    let flights = await Flight.findOne({
      where: { flight_number: name },
        include: [
        {
            model: Airport,
            as: "airports",
            through: { attributes: ["airportTo"] },
        },
        {
            model: ClassDetails,
            as: "class_details",
            include: [
            {
                model: Seats,
                as: "seats",
            },
            ],
        },
        ],
    });
    return flights;
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
    console.log(JSON.parse(JSON.stringify(flights)))
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
async function getFlightById(id){
    try {
      let flight = await Flight.findAll({
        exclude: ["createdAt", "updatedAt"],
        where: { id: id },
        include: [
          { model: Airline },
          { model: Airport },
          { model: ClassDetails },
        ],
      });
      if (!flight) return null;
      let flightsData = await finalView(flight);
      return (flightsData);
    } catch (e) {
      for (let err in e.errors) {
        console.log(e.errors[err].message);
      }
      return null
    }
}
let getFlightFromTo = async (req, res) => {
  try {
    let airportFromId = await findAirportId(req.body.airportFrom);
    let airportToId = await findAirportId(req.body.airportTo);
    let flights = await FlightAirport.findAll({
      where: { airportFrom: airportFromId.AP_id, airportTo: airportToId.AP_id },
      attributes: ["flightId"],
    });
    let flightsData = [];
    for (const flight of flights) {
      flightsData.push(flight.flightId);
    }
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
let getFlightFromToDateClassNo = async (req, res) => {
  try {
    let airportFromId = await findAirportId(req.body.airportFrom);
    let airportToId = await findAirportId(req.body.airportTo);
    let flights = await FlightAirport.findAll({
      where: { airportFrom: airportFromId.AP_id, airportTo: airportToId.AP_id },
      attributes: ["flightId"],
    });
    let flightsData = [];
    for (const flight of flights) {
      flightsData.push(flight.flightId);
    }
    if (!flightsData)
      return res.status(404).send("Flights data are not found...");
    let flightsAllData = await getAllFlightsWithIdsWithDateClassNo(
      flightsData,
      req.body.date,
      req.body.class,
      req.body.no
    );
    res.status(200).send(flightsAllData);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("Flights data are not found...");
  }
};
let getFlightFromToElasticDateClassNo = async (req, res) => {
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
    let flightsAllData = await getAllFlightsWithIdsWithDateClassNoFlexible(
      flightsData,
      req.body.dateFrom,
      req.body.dateTo,
      req.body.class,
      req.body.no
    );
    res.status(200).send(flightsAllData);
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
        // where: {
        //   ticketTicketNumber: null,
        // },
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
  try {
  let seats = req.body.seats;
  let users = req.body.users;
  // Check if no of seats are equal to users
  if (seats.length !== users.length) {
    return res.status(400).send("Number of seats and users are not equal");
  }
  // generate ticket number for each seat
    let reserved = [];
    let notReserved = [];
for (let i = 0; i < seats.length; i++) {
    let ticketData = await generateTicketNumber(seats[i], users[i]);
    if (ticketData === null) {
      notReserved.push({ seat: seats[i], user: users[i] });
    } else {
      reserved.push(ticketData)
    }
}
    if (notReserved.length > 0) {
        return res.status(400).send({ reserved: reserved, notReserved: notReserved })
    }
    res.status(200).send(reserved);
    } catch (e) {
        for (let err in e.errors) {
            console.log(e.errors[err].message);
        }
        res.status(404).send("Seats are not reserved...");
  }
};
async function generateTicketNumber(seat, user) {
  let t = await sequelize.transaction();
  try {
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
    }, { transaction: t });
    if (!seatData) return "Seat is not found...";
    if (seatData.ticketTicketNumber !== null) return "Seat is not available...";
    // check user is available
    let userData = await Client.findOne({
      where: {
        id: user,
      },
    }, { transaction: t });
    if (!userData) return "User is not found...";
    // generate ticket number
    let classId = seatData.class_detail.class_details_id;
    let flightId = seatData.class_detail.flight.id;
    // get instance of class and flight
    let classData = await ClassDetails.findOne({
          where: {
            class_details_id: classId,
          }
        }, { transaction: t }
    );
    let flightData = await Flight.findOne({
          where: {
            id: flightId,
          }
        }, { transaction: t }
    );
    // generate ticket
    let newTicket = await Ticket.create({});
    // add ticket to user
    await userData.addTicket(newTicket, { transaction: t });
    // add ticket to seat
    await seatData.setTicket(newTicket, { transaction: t });
    // add ticket to class
    await classData.addTicket(newTicket, { transaction: t });
    // add ticket to flight
    await flightData.addTicket(newTicket, { transaction: t });
    // commit transaction
    await t.commit();
    // return ticket number
    return await getTicketData(newTicket.ticket_number);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    await t.rollback();
    return null;
  }
}
// get all tickets data of user and linked users
let getAllTicketsLinkedData = async (req, res) => {
  try {
    let user_id = req.body.id;
    let allTickets = await searchForLinkedUsers(user_id);
    if (allTickets.length === 0)
      return res.status(404).send("No tickets found...");
    let allTicketsData = [];
    for (let ticket of allTickets) {
      let ticketData = await getTicketData(ticket);
      if (ticketData) allTicketsData.push(ticketData);
    }
    if (allTicketsData.length === 0)
      return res.status(404).send("No tickets found...");
    res.status(200).send(allTicketsData);
  }catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("No tickets found...");
  }
}
// get all tickets number of user and users linked to
async function searchForLinkedUsers(user_id){
  // get all clients linked with this user_id
  let linkedUsers = await Client.findAll({
    where:{
      linked_users: user_id
    },
    attributes:{
      include: ["id"]
    }
  })
  // push user_id to linkedUsers array
  linkedUsers.push({id: user_id})
  let allTickets = []
  for (let user of linkedUsers){
    // get tickets of each user
    let tickets = await Ticket.findAll({
        where:{
            clientId: user.id
        },
        attributes:{
            include: ["ticket_number"]
        }
    })
    // push tickets to allTickets array
    if (tickets) {
        for (let ticket of tickets){
            allTickets.push(ticket.ticket_number)
        }
    }
  }
  if (allTickets.length === 0) return null
    return allTickets
}
// get ticket details by ticket number
let getTicketDetailsByTicketNumber = async (req, res) => {
    let ticketId = req.body.id;
    let ticketData = await getTicketData(ticketId);
    if (!ticketData) return res.status(404).send("Ticket is not found...");
    res.status(200).send(ticketData);
}
// get ticket data
async function getTicketData(ticketId) {
  try {
    let ticketData = await Ticket.findOne({
        where: {
        ticket_number: ticketId,
        },
        attributes: ["ticket_number"],
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
            attributes: ["id"],
        },
        {
            model: Client
        },
        ],
    });
    // get flight data
    // console.log(JSON.parse(JSON.stringify(ticketData)))
    let flightData = await getFlightById(ticketData.flight.id);
    let finalData = flightData[0];
    // return finalData;
    finalData.ticket =  ticketData.ticket_number;
    finalData.seat =  ticketData.seat.seat_no;
    finalData.class =  ticketData.class_detail.class;
    finalData.price =  ticketData.class_detail.price;
    finalData.user =  ticketData.client.fullName;
    delete finalData.classes
    return finalData;
    } catch (e) {
        for (let err in e.errors) {
            console.log(e.errors[err].message);
        }
        return null;
    }
  }

  //search by ticket no
    let searchByTicketNo = async (req, res) => {
          try {
                let ticketId = req.body.id;
                let ticketData = await getTicketData(ticketId);
                if (!ticketData) return res.status(404).send("Ticket is not found...");
                res.status(200).send(ticketData);
            } catch (e) {
                for (let err in e.errors) {
                    console.log(e.errors[err].message);
                }
                res.status(404).send("Ticket is not found...");
            }
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
      attributes: ["AP_name","AP_city","AP_country"],
      where: { AP_id: flight["airports"][0]["flightAirports"]["airportTo"] },
    });
    return {
      flight_id: flight.id,
      flight_number: flight.flight_number,
      take_off_time: flight.take_off_time,
      take_off_date: flight.take_off_date,
      landing: flight.landing_time,
      status: flight.status,
      duration: flight.duration,
      no_of_stops: flight.no_of_stops,
      airline_name: flight.airline.AL_name,
      airportFrom: flight.airports[0].AP_name,
      airportFromCountry: flight.airports[0].AP_country,
      airportFromCity: flight.airports[0].AP_city,
      airportTo: airportTo.AP_name,
      airportToCountry: airportTo.AP_country,
      airportToCity: airportTo.AP_city,
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
          [Op.in]: ids,
        },
      },
      attributes: { exclude: ["createdAt", "updatedAt"]},
      include: [
        { model: Airline },
        { model: Airport },
        { model: ClassDetails },
      ],
    });
    // return res.send(flights);
    if (!flights) return ("Flights data are not found...");
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
          [Op.in]: ids,
        },
        take_off_date: {
          [Op.gte]: dat,
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
    if (!flights) return ("Flights data are not found...");
    return await finalView(flights);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    return "Flights data are not found...";
  }
}
async function getAllFlightsWithIdsWithDateClassNo(ids, date, className, no) {
  try {
    let dat = new Date(date);
    let flights = await Flight.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        take_off_date: {
          [Op.gte]: dat,
        },
      },
      exclude: ["createdAt", "updatedAt"],
      include: [
        {model: Airline},
        {model: Airport},
        {
          model: ClassDetails, where: {
            class: className,
            available_seats: {[Op.gte]: no}
          }
        },
      ],
    });
    // return res.send(flights);
    if (!flights) return ("Flights data are not found...");
    return await finalView(flights);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    return "Flights data are not found...";
  }
}
async function getAllFlightsWithIdsWithDateClassNoFlexible(ids, dateFrom, dateTo, className, no) {
  try {
    let datfrom = new Date(dateFrom);
    let datto = new Date(dateTo);
    let flights = await Flight.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        take_off_date: {
          [Op.between]: [datfrom, datto ]
        },
      },
      exclude: ["createdAt", "updatedAt"],
      include: [
        { model: Airline },
        { model: Airport },
        { model: ClassDetails, where:{
            class: className,
            available_seats: {[Op.gte]: no}
          } },
      ],
    });
    // return res.send(flights);
    if (!flights) return ("Flights data are not found...");
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
  getFlightFromToDateClassNo,
  getFlightSeats,
  reserveSeats,
  getTicketDetailsByTicketNumber,
  getFlightFromToElasticDateClassNo,
  getAllTicketsLinkedData,
  searchByTicketNo
}
