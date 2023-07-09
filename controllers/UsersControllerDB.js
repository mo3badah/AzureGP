// import user model of db
const Client = require("../models/client");
const sequelize = require("../models/sequelize");
const ClientPhone = require("../models/client_phone");
const ClientPassport = require("../models/client_passport");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { json } = require("express");
const Innovation = require("../models/InnovationModelDB");
require("dotenv").config();
let postNewClient = async (req, res) => {
  try {
    let newClient = await createNewUser(req.body);
    if (!newClient){
        return res
            .status(400)
            .send(`user with this email: ${req.body.email} is already exist`);
    }
    const token = await jwtCreate(newClient);
    // send response
    res.header("x-auth-token", token);
    res
      .status(200)
      .send(
        `Ok user: ${req.body.Fname} ${req.body.Lname} registered with email: ${req.body.email}`
      );
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(400).send(`Bad Request...`);
  }
};
let getAllClients = async (req, res) => {
  try {
    let users = await Client.findAll({
      include: ClientPhone,
    });
    if (!users) return res.status(404).send("Clients data are not found...");
    res.send(users);
  } catch (e) {
    for (let err in e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(404).send("Clients data are not found...");
  }
};
let addNewClientFromAdmin = async (req, res) => {
  // check if user founded or not
  try {
    let client = await createNewUser(req.body);
    // send response
    res.status(200).send(client);
  } catch (e) {
    for (let err of e.errors) {
      console.log(e.errors[err].message);
    }
    res.status(400).send(`Can't Add user try again later...`);
  }
};
let addMultipleClients = async (req, res) => {
  try {
    let newClients = req.body;
    let allClientsAdded = [];
    let notAdded = [];
    for (let client of newClients) {
      let newClient = await createNewUser(client);
      if (newClient === null) {
        notAdded.push({ email: client.email, error: "Email already exists" });
      }else if (newClient === "error") {
        notAdded.push({ email: client.email, error: "Not Unique Passport" });
      }else {
        allClientsAdded.push(newClient.id );
      }
    }
    if (notAdded.length === 0) {
      for (let i=1; i < allClientsAdded.length; i++){
        await linkUserToSup(allClientsAdded[0], allClientsAdded[i])
      }
      res.status(200).send(allClientsAdded)
    }
    else
      res.status(400).send({
        added: allClientsAdded,
        notAdded: notAdded,
      });
  } catch (e) {
    res.status(400).send(`Can't Add user try again later...`);
  }
};
async function linkUserToSup(sup, user){
  // get these models instances first
  try {
    superUser = await getUserById(sup)
    linkedUser = await getUserById(user)
    await linkedUser.setLink(superUser)
    return (`User ${linkedUser.email} is linked with ${superUser.email}`)
  }catch (e) {
      return (`not linked user with email ${user} to ${sup}`)
  }
}
async function getUserById(user_id){
  return await Client.findOne({
    where:{
      id: user_id
    },
    attributes: {
      include: ["id", "email"]
    }
  })
}
// update users
let editNewClient = async (req, res) => {
  try {
    let salt = await bcrypt.genSalt(10);
    let hashPswd = await bcrypt.hash(req.body.password, salt);
    let updClient = await Client.update(
      {
        Fname: req.body.Fname,
        Mname: req.body.Mname,
        Lname: req.body.Lname,
        email: req.body.email,
        password: hashPswd,
        country: req.body.country,
        state: req.body.state,
        street: req.body.street,
        birth: req.body.birth,
        gender: req.body.gender,
      },
      { where: { id: req.body.id } }
    );
    console.log(updClient);
    if (req.body.phone) {
      let updPhone = await ClientPhone.update(
        {
          phone: req.body.phone,
        },
        { where: { clientId: req.body.id } }
      );
      if (updPhone[0] === 0)
        await ClientPhone.create({
          phone: req.body.phone,
          clientId: req.body.id,
        });
    }
    if (req.body.passport) {
      let updPassport = await ClientPassport.update(
        {
          passport: req.body.passport,
        },
        { where: { clientId: req.body.id } }
      );
      console.log(updPassport);
      if (updPassport[0] === 0)
        await ClientPassport.create({
          passport: req.body.passport,
          clientId: req.body.id,
        });
    }
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
// let deleteClient = async (req, res) => {
//   try {
//     let delClient = await Client.findOneAndRemove({ email: req.params.email });
//     if (!delClient)
//       return res
//         .status(404)
//         .send(`user with email ${req.params.email} is not found to be deleted`);
//     res.send(`deleted successfully : ` + delClient);
//   } catch (e) {
//     for (let err in e.errors) {
//       console.log(e.errors[err].message);
//     }
//     res
//       .status(404)
//       .send(`user with email ${req.params.email} is not found to be deleted`);
//   }
// };
async function jwtCreate(user) {
  return await jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    process.env.JWT_PRIVATE_KEY
  );
}
async function createNewUser(user) {
  const t = await sequelize.transaction();
  try {
    let client = await Client.findOne({ where: { email: user.email }, transaction: t });
    if (client) {
      await t.rollback();
      return null;
    }
    let salt = await bcrypt.genSalt(10);
    let hashPswd = await bcrypt.hash(user.password, salt);
    let newClientPassport, newClientPhone;
    let newClient = await Client.create({
      Fname: user.Fname,
      Mname: user.Mname,
      Lname: user.Lname,
      email: user.email,
      password: hashPswd,
      country: user.country,
      state: user.state,
      street: user.street,
      gender: user.gender,
      birth: user.birth,
    }, { transaction: t });
    if (user.phone) {
      newClientPhone = await ClientPhone.create({
        phone: user.phone,
      }, { transaction: t });
      await newClientPhone.setClient(newClient, { transaction: t });
    }
    if (user.passport) {
        newClientPassport = await ClientPassport.create({
          passport: user.passport,
        }, { transaction: t });
      await newClientPassport.setClient(newClient, { transaction: t });
    }
    await t.commit();
    return newClient;
  } catch (e) {
    if (e.errors) {
      for (let err of e.errors) {
        console.log(err.message);
      }
    }
    await t.rollback();
    return "error";
  }

}
module.exports = {
  postNewClient,
  getAllClients,
  addNewClientFromAdmin,
  addMultipleClients,
  editNewClient
};
