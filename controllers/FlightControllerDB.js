// import user model of db
const Flight = require("../models/flight");
const Airport = require("../models/airport");
const FlightAirport = require("../models/FlightAirports");
const sequelize = require("../models/sequelize");
const { Op } = require("sequelize");
const Airline = require("../models/airline");
const Stops = require("../models/stops");
const Types = require("../models/type");
const ClassDetails = require("../models/class_details");
const Seats = require("../models/seats");
const Ticket = require("../models/ticket");
const Client = require("../models/client");
const Child = require("../models/childs");

async function createNewFlight(flight) {
  let t = await sequelize.transaction();
  try {
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
    }, {transaction: t});
    // get the type of the flight
    let type = await Types.findOne({
      where: { flight_type: flight.type },
    }, {transaction: t});
    if (!type) {
      type = {
        no_of_first_class_seats: 12,
        no_of_economical_seats: 24,
        no_of_business_seats: 144,
      };
    } else {
      type.addFlight(newFlight, {transaction: t});
    }
    if (noOfStops > 0) {
      stops.forEach(async (stop) => {
        let airport = await Airport.findOne({
          where: { AP_name: stop.airport_name },
        }, {transaction: t});
        let newStop = await Stops.create({
          date: stop.date,
          time: stop.time,
          airport_id: airport.AP_id,
          duration: stop.duration,
        }, {transaction: t});
        newFlight.addStops(newStop, {transaction: t});
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
        }, {transaction: t});
        newFlight.addClass_details(newClasses);
        switch (class_detail.class) {
          case "business":
            newClasses.available_seats = no_of_business_seats;
            businessSeats.forEach(async (seat) => {
              let newSeat = await Seats.create({
                seat_no: seat,
              }, {transaction: t});
              newClasses.addSeats(newSeat, {transaction: t});
            });
            break;
          case "economi":
            newClasses.available_seats = no_of_economical_seats;
            economiSeats.forEach(async (seat) => {
              let newSeat = await Seats.create({
                seat_no: seat,
              }, {transaction: t});
              newClasses.addSeats(newSeat, {transaction: t});
            });
            break;
          default:
            newClasses.available_seats = no_of_first_class_seats;
            firstClassSeats.forEach(async (seat) => {
              let newSeat = await Seats.create({
                seat_no: seat,
              }, {transaction: t});
              newClasses.addSeats(newSeat, {transaction: t});
            });
            break;
        }
      });
    }
    // get all the airports from the request
    let airportFrom = await Airport.findOne({
      where: { AP_name: flight.airportFrom },
    }, {transaction: t});
    let airportTo = await findAirportId(flight.airportTo, {transaction: t});
    let airline_id = await Airline.findOne({
      where: { AL_name: flight.airline_name },
    }, {transaction: t});
    // Add the airports to the flight record
    await airline_id.addFlight(newFlight, {transaction: t});
    await newFlight.addAirport(
      airportFrom,
      {
        through: { airportTo: airportTo.AP_id },
      },
      { transaction: t }
    );
    await t.commit();
  } catch (e) {
    await t.rollback();
  }
}
// to make a flight auto generated every specific time
// get the flight data from DB
let getFlightData = async (name) => {
  let allFlightData = await Flight.findOne({
    where: { flight_number: name },
    attributes: ["id"],
  });
  let stops = await Stops.findAll({
    attributes: { exclude: ["createdAt", "updatedAt", "id", "flightId"] },
    where: { flightId: allFlightData.flight_id },
    include: [
      {
        model: Airport,
        attributes: "AP_name",
      },
    ],
  });
};
let getFlightWithName = async (req, res) => {
  try {
    let flight = await getFlightData(req.body.name);
    res.status(200).send(flight);
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad Request...");
  }
};
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
    console.log(JSON.parse(JSON.stringify(flights)));
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
async function getFlightById(id) {
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
    return flightsData;
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    return null;
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
        attributes: ["seat_no", "id", "status", "ticketTicketNumber"],
      },
    ],
    order: [[{ model: Seats, as: "seat" }, "seat_no", "ASC"]],
  });
  if (!classes) res.status(404).send("Flight with this ID is not found...");
  res.status(200).send(classes);
};
let getClassSeats = async (req, res) => {
  classId = req.body.id;
  let seats = await Seats.findAll({
    attributes: ["seat_no", "id", "status", "ticketTicketNumber"],
    where: {
      classDetailClassDetailsId: classId,
    },
  });
  if (!seats) res.status(404).send("Seats with this Class ID is not found...");
  res.status(200).send(seats);
};
// Reserve number of seats in a flight to a specific users
let reserveSeats = async (req, res) => {
  try {
    let seats = req.body.seats;
    let users = req.body.users[0].clients;
    let childs = req.body.users[0].childs;
    let childsNo = 0;
    if (!childs || childs.length === 0) {
    }else {
      childsNo = childs.length;
    }
    // Check if no of seats are equal to users
    if (seats.length !== users.length + childsNo) {
      return res.status(400).send("Number of seats and users are not equal");
    }
    // generate ticket number for each seat
    let reserved = [];
    let notReserved = [];
    for (let i = 0; i < seats.length; i++) {
      if (i < users.length) {
        let ticketData = await generateTicketNumber(seats[i], users[i], false);
        if (ticketData === null || typeof ticketData === "string") {
          notReserved.push({
            seat: seats[i],
            user: users[i],
            error: ticketData,
          });
        } else {
          reserved.push(ticketData);
        }
      } else {
        let ticketData = await generateTicketNumber(
          seats[i],
          childs[i - users.length],
          true
        );
        if (ticketData === null || typeof ticketData === "string") {
          notReserved.push({ seat: seats[i], user: childs[i - users.length], error: ticketData });
        } else {
          reserved.push(ticketData);
        }
      }
    }
    if (notReserved.length > 0) {
      return res
        .status(400)
        .send({ reserved: reserved, notReserved: notReserved });
    }
    res.status(200).send(reserved);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("Seats are not reserved...");
  }
};
async function generateTicketNumber(seat, user, isChild) {
  let t = await sequelize.transaction();
  try {
    // check seat is available
    let seatData = await Seats.findOne(
      {
        where: {
          id: seat,
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
      },
      { transaction: t }
    );
    if (!seatData) throw new Error("Seat is not found");
    if (seatData.ticketTicketNumber !== null)
      throw new Error("Seat is not available");
    // check user is available
    let userData;
    if (!isChild) {
      userData = await Client.findOne(
        {
          where: {
            id: user,
          },
        },
        { transaction: t }
      );
    } else {
      userData = await Child.findOne(
        {
          where: {
            id: user,
          },
        },
        { transaction: t }
      );
    }

    if (!userData) throw new Error("User is not found");
    // generate ticket number
    let classId = seatData.class_detail.class_details_id;
    let flightId = seatData.class_detail.flight.id;
    // get instance of class and flight
    let classData = await ClassDetails.findOne(
      {
        where: {
          class_details_id: classId,
        },
      },
      { transaction: t }
    );
    let price = classData.price;
    let flightData = await Flight.findOne(
      {
        where: {
          id: flightId,
        },
      },
      { transaction: t }
    );
    // generate ticket
    let newTicket = await Ticket.create({}, { transaction: t });
    // add ticket to user
    if (!isChild) {
      await userData.addTicket(newTicket, { transaction: t });
      newTicket.price = price;
      newTicket.added_lagguge = 0;
      await newTicket.save({ transaction: t });
    }
    // add ticket to seat
    await seatData.setTicket(newTicket, { transaction: t });
    // add ticket to class
    await classData.addTicket(newTicket, { transaction: t });
    // add ticket to flight
    await flightData.addTicket(newTicket, { transaction: t });
    // commit transaction
    if (isChild) {
      await newTicket.addChilds(userData, { transaction: t });
      newTicket.price = price * 0.6;
      newTicket.added_lagguge = 0;
      await newTicket.save({ transaction: t });
    }
    await t.commit();
    // return ticket number
    return await getTicketData(newTicket.ticket_number);
  } catch (e) {
    await t.rollback();
    return `${e}`;
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
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("No tickets found...");
  }
};
// get all tickets number of user and users linked to
async function searchForLinkedUsers(user_id) {
  // get all clients linked with this user_id
  let linkedUsers = await Client.findAll({
    where: {
      linked_users: user_id,
    },
    attributes: ["id"],
  });
  let linkChilds = await Child.findAll({
    where: {
      clientId: user_id,
    },
    attributes: ["id"],
  });
  // push user_id to linkedUsers array
  linkedUsers.push({ id: user_id });
  let allTickets = [];
  for (let user of linkedUsers) {
    // get tickets of each user
    let tickets = await Ticket.findAll({
      where: {
        clientId: user.id,
      },
      attributes: ["ticket_number"],
    });
    // push tickets to allTickets array
    if (tickets) {
      for (let ticket of tickets) {
        allTickets.push(ticket.ticket_number);
      }
    }
  }
  for (let child of linkChilds) {
    // get tickets of each user
    let tickets = await Ticket.findAll({
      include: [
        {
          model: Child,
          through: {
            attributes: ["childId"], // Include the desired attribute from Childs table
          },
          attributes: ["id"], // Exclude all attributes from Childs table
          as: "childs", // Specify the alias for the Childs association
          where: {
            id: child.id, // Filter by child.id
          },
        },
      ],
    });
    console.log(JSON.parse(JSON.stringify(tickets)));
    // push tickets to allTickets array
    if (tickets) {
      for (let ticket of tickets) {
        allTickets.push(ticket.ticket_number);
      }
    }
  }
  if (allTickets.length === 0) return null;
  return allTickets;
}
// get ticket details by ticket number
let getTicketDetailsByTicketNumber = async (req, res) => {
  let ticketId = req.body.id;
  let ticketData = await getTicketData(ticketId);
  if (!ticketData) return res.status(404).send("Ticket is not found...");
  res.status(200).send(ticketData);
};
// get ticket data
async function getTicketData(ticketId) {
  try {
    let ticketData = await Ticket.findOne({
      where: {
        ticket_number: ticketId,
      },
      attributes: ["ticket_number", "price", "added_lagguge"],
      include: [
        {
          model: Seats,
          attributes: ["seat_no"],
        },
        {
          model: ClassDetails,
          attributes: ["class", "price"],
        },
        {
          model: Flight,
          attributes: ["id"],
        },
        {
          model: Client,
        },
        {
          model: Child,
           include: [
            {
                model: Client
                },
            ],
        }
      ],
    });
    let fullName;
    if (ticketData.client === null) {
      let father = ticketData.childs[0].client.fullName;
      if (father){
        fullName = `${ticketData.childs[0].Fname} ${father}`;
      } else {
        fullName = ticketData.childs[0].fullName;
      }
    } else {
      fullName = ticketData.client.fullName;
    }
    // get flight data
    let flightData = await getFlightById(ticketData.flight.id);
    let finalData = flightData[0];
    // return finalData;
    finalData.ticket = ticketData.ticket_number;
    finalData.seat = ticketData.seat.seat_no;
    finalData.class = ticketData.class_detail.class;
    finalData.price = ticketData.price;
    finalData.added_lagguge = ticketData.added_lagguge;
    finalData.user = fullName;
    delete finalData.classes;
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
};
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
function generateFirstClassSeats(numSeats) {
  const seatLetters = ["A", "B", "C"]; // Letters representing seat rows
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
      attributes: ["AP_name", "AP_city", "AP_country"],
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
          class_id: class_detail.class_details_id,
          class_type: class_detail.class,
          price: class_detail.price,
          seats: class_detail.available_seats,
          extra_luggage_price: class_detail.extra_luggage_price,
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
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        { model: Airline },
        { model: Airport },
        { model: ClassDetails },
      ],
    });
    // return res.send(flights);
    if (!flights) return "Flights data are not found...";
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
    if (!flights) return "Flights data are not found...";
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
          [Op.eq]: dat,
        },
      },
      exclude: ["createdAt", "updatedAt"],
      include: [
        { model: Airline },
        { model: Airport },
        {
          model: ClassDetails,
          where: {
            class: className,
            available_seats: { [Op.gte]: no },
          },
        },
      ],
    });
    // return res.send(flights);
    if (!flights) return "Flights data are not found...";
    return await finalView(flights);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    return "Flights data are not found...";
  }
}
async function getAllFlightsWithIdsWithDateClassNoFlexible(
  ids,
  dateFrom,
  dateTo,
  className,
  no
) {
  try {
    let datfrom = new Date(dateFrom);
    let datto = new Date(dateTo);
    let flights = await Flight.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        take_off_date: {
          [Op.between]: [datfrom, datto],
        },
      },
      exclude: ["createdAt", "updatedAt"],
      include: [
        { model: Airline },
        { model: Airport },
        {
          model: ClassDetails,
          where: {
            class: className,
            available_seats: { [Op.gte]: no },
          },
        },
      ],
    });
    // return res.send(flights);
    if (!flights) return "Flights data are not found...";
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
  getClassSeats,
  reserveSeats,
  getTicketDetailsByTicketNumber,
  getFlightFromToElasticDateClassNo,
  getAllTicketsLinkedData,
  searchByTicketNo,
  getFlightWithName,
};
