// import user model of db
const Client = require("../models/client");
const Employee = require("../models/employee");
const Airport = require("../models/airport");
const Child = require("../models/childs");
const sequelize = require("../models/sequelize");
const ClientPhone = require("../models/client_phone");
const ClientPassport = require("../models/client_passport");
const bcrypt = require("bcrypt");
const {userToken} = require("../config/jwt");
const {AUTH_MAX_AGE} = process.env;
require("dotenv").config();
let postNewClient = async (req, res) => {
  try {
    let newClient = await createNewUser(req.body);
    if (typeof newClient === "string"){
      return res.status(401).json({ error: newClient});
    }
    let payload = {
      id: newClient.id,
      fullName: newClient.fullName,
      email: newClient.email
    }
    const token = await userToken(payload);
    payload.token=token
    res.cookie('token', token, {
      httpOnly: false,
      maxAge: AUTH_MAX_AGE,
    });
    res.status(200).send(payload);
  }catch(error) {
    return res.status(400).json({ error: error });
  }
};
let getAllClients = async (req, res) => {
  try {
    let users = await Client.findAll({
      include: [ClientPhone, ClientPassport]
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
// get specific user
let getSpecificClient = async (req, res) => {
    try {
      const { job_title } = req.user;
      if (job_title === 'user'){
        let user = await Client.findOne({
          where: { id: req.user.id },
          include: [ClientPhone, ClientPassport]
        });
        if (!user) return res.status(404).send("User is not found...");
        res.send(user);
      }else {
        let employee = await Employee.findOne({
          where: { SSN: req.user.SSN },
          include: [
            { model: Employee, as: 'supervisor' }, // Include the supervisor association
            Airport, // Include the Airport association
          ],
        });
        if (!employee) return res.status(404).send("employee is not found...");
        res.send(employee);
      }
    } catch (e) {
        for (let err in e.errors) {
        console.log(e.errors[err].message);
        }
        res.status(404).send("Client is not found...");
    }
}
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
    let allChildsAdded = [];
    let notAdded = [];
    for (let client of newClients) {
      let newClient = await createNewUser(client);
      if (newClient === null) {
        notAdded.push({ email: client.email, error: "Email already exists" });
      }else if (newClient === "error") {
        notAdded.push({ email: client.email, error: "Not Unique Passport" });
      }else {
        allClientsAdded.push(newClient.id );
        if (newClient.childs){
          allChildsAdded = newClient.childs;
        }
      }
    }
    if (notAdded.length === 0) {
      for (let i=1; i < allClientsAdded.length; i++){
        await linkUserToSup(allClientsAdded[0], allClientsAdded[i])
      }
        res.status(200).send({
          clients: allClientsAdded,
          childs: allChildsAdded
        })
    }
    else
      res.status(400).send({
        clients: allClientsAdded,
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
async function createNewUser(user) {
  const t = await sequelize.transaction();
  try {
    let client = await Client.findOne({ where: { email: user.email }, transaction: t });
    if (client) {
      await t.rollback();
      return `user with this email: ${client.email} is already exist`;
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
        if (!newClientPhone) {
          await t.rollback();
          return "Check your phone number"
        }
    }
    if (user.passport) {
        newClientPassport = await ClientPassport.create({
          passport: user.passport,
        }, { transaction: t });
      await newClientPassport.setClient(newClient, { transaction: t });
      if (!newClientPassport) {
        await t.rollback();
        return  "Check your passport"
      }
    }
    let childs = [];
    if (user.childs){
      for (child of user.childs){
        try {
          let ifChild = await Child.findOne({ where: { passport: child.passport }, transaction: t });
            if (ifChild) {
              await ifChild.setClient(newClient, { transaction: t });
                childs.push(ifChild.id);
            }else {
              newChild = await Child.create({
                Fname: child.Fname,
                Lname: child.Lname,
                gender: child.gender,
                birth: child.birth,
                passport: child.passport,
              }, { transaction: t });
              await newChild.setClient(newClient, { transaction: t });
              childs.push(newChild.id);
            }
        }catch (e) {
          await t.rollback();
          return "Check your childs data";
        }
      }
    }
    if (childs.length > 0){
      newClient.childs = childs;
    }
    await t.commit();
    return newClient;
  } catch (e) {
    await t.rollback();
    return e.errors[0].message
  }

}
// delete client using client id and remove all his childs and tickets
let deleteClient = async (req, res) => {
    try {
        let client = await Client.findOne({ where: { id: req.body.id } });
        if (!client) return res.status(404).send(`Client with id ${req.body.id} is not found`);
        let deletedClient = await Client.destroy({ where: { id: req.body.id } });
        if (!deletedClient) return res.status(404).send(`Client with id ${req.body.id} is not found to be deleted`);
        return res.status(200).send("deleted user successfully");
    } catch (e) {
        res
        .status(404)
        .send(e.errors[0].message);
    }
}
module.exports = {
  postNewClient,
  getAllClients,
  addNewClientFromAdmin,
  addMultipleClients,
  editNewClient,
  getSpecificClient,
  deleteClient
};
