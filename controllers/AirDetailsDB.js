// import user model of db
const sequelize = require("sequelize");
const Airport = require("../models/airport");
const Airline = require("../models/airline");
const { Types } = require("mongoose");

let postNewAirline = async (req, res) => {
  // check if user founded or not
  try {
    let airline = await Airline.findOne({
      where: { AL_three_letter_code: req.body.AL_three_letter_code },
    });
    if (airline)
      return res
        .status(400)
        .send(
          `airline with this three letter code: ${req.body.AL_three_letter_code} is already exist`
        );
    let newAirline = await Airline.create({
      AL_name: req.body.AL_name,
      AL_three_letter_code: req.body.AL_three_letter_code,
      AL_phone: req.body.AL_phone,
    });
    // send response
    res
      .status(200)
      .send(
        `Ok Airline with name: ${req.body.AL_name} has been created successfully`
      );
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(400).send(`Bad Request...`);
  }
};
let postNewAirlines = async (req, res) => {
  try {
    let airlinesData = req.body; // Assuming the request body contains an array of airports
    // Check if any of the airports already exist in the database
    let existingAirlines = await Airline.findAll({
      where: {
        AL_three_letter_code: airlinesData.map(
          (airline) => airline.AL_three_letter_code
        ),
      },
    });
    if (existingAirlines.length > 0) {
      let existingAirlineNames = existingAirlines.map(
        (airline) => airline.AL_three_letter_code
      );
      let duplicateAirlineNames = airlinesData
        .filter((airline) =>
          existingAirlineNames.includes(airline.AL_three_letter_code)
        )
        .map((airline) => airline.AL_three_letter_code);
      return res
        .status(400)
        .send(
          `Airlines with the following AL_three_letter_code already exist: ${duplicateAirlineNames.join(
            ", "
          )} please check your data and try again`
        );
    }
    // Create and save the new airports
    let createdAirlines = await Airline.bulkCreate(airlinesData);
    // Send success response
    res.status(200).send("Airlines have been created successfully");
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad Request...");
  }
};

let postNewAirport = async (req, res) => {
  // check if user founded or not
  try {
    let airport = await Airport.findOne({
      where: { AP_name: req.body.AP_name },
    });
    if (airport)
      return res
        .status(400)
        .send(`Airport with this name: ${req.body.AP_name} is already exist`);
    let newAirport = await Airport.create({
      AP_name: req.body.AP_name,
      AP_city: req.body.AP_city,
      AP_state: req.body.AP_state,
      AP_country: req.body.AP_country,
      AP_phone: req.body.AP_phone,
    });
    // send response
    res
      .status(200)
      .send(
        `Ok Airport with name: ${req.body.AP_name} has been created successfully`
      );
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(400).send(`Bad Request...`);
  }
};
let postNewAirports = async (req, res) => {
  try {
    let airportsData = req.body; // Assuming the request body contains an array of airports
    // Check if any of the airports already exist in the database
    let existingAirports = await Airport.findAll({
      where: { AP_name: airportsData.map((airport) => airport.AP_name) },
    });
    if (existingAirports.length > 0) {
      let existingAirportNames = existingAirports.map(
        (airport) => airport.AP_name
      );
      let duplicateAirportNames = airportsData
        .filter((airport) => existingAirportNames.includes(airport.AP_name))
        .map((airport) => airport.AP_name);
      return res
        .status(400)
        .send(
          `Airports with the following names already exist: ${duplicateAirportNames.join(
            ", "
          )} please check your data and try again`
        );
    }
    // Create and save the new airports
    let createdAirports = await Airport.bulkCreate(airportsData);
    // Send success response
    res.status(200).send("Airports have been created successfully");
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad Request...");
  }
};

let getAllAirports = async (req, res) => {
  try {
    let airports = await Airport.findAll({
      attributes: { exclude: ["createdAt", "updatedAt","AP_id","AP_state","AP_phone","AP_fullName"] },
    });
    if (!airports)
      return res.status(404).send("Airports data are not found...");
    res.send(airports);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("Airports data are not found...");
  }
};
// update users
let updateToAdminClient = async (req, res) => {
  try {
    let updClient = await Client.updateOne(
      { email: req.body.email },
      {
        $set: {
          flag: true,
        },
      },
      { returnOriginal: false }
    );
    if (!updClient)
      return res
        .status(404)
        .send(`Client with email ${req.body.email} is not found to be updated`);
    res.send(updClient);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res
      .status(404)
      .send(`Client with email ${req.body.email} is not found to be updated`);
  }
};
let updateToClient = async (req, res) => {
  try {
    let updClient = await Client.updateOne(
      { email: req.body.email },
      {
        $set: {
          flag: false,
        },
      },
      { returnOriginal: false }
    );
    if (!updClient)
      return res
        .status(404)
        .send(`Client with email ${req.body.email} is not found to be updated`);
    res.send(updClient);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res
      .status(404)
      .send(`Client with email ${req.body.email} is not found to be updated`);
  }
};
// delete Innovation
let deleteClient = async (req, res) => {
  try {
    let delClient = await Client.findOneAndRemove({ email: req.params.email });
    if (!delClient)
      return res
        .status(404)
        .send(`user with email ${req.params.email} is not found to be deleted`);
    res.send(`deleted successfully : ` + delClient);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res
      .status(404)
      .send(`user with email ${req.params.email} is not found to be deleted`);
  }
};
module.exports = {
  postNewAirline,
  postNewAirport,
  postNewAirports,
  postNewAirlines,
  getAllAirports,
};
