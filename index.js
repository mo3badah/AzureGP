// importing express and other frameworks which needed for this application to be executed.
import express, { json } from "express";
import * as path from "path";
// mongoose is the package that we need it to deal with mongodb database through nodejs
// const mongoose = require("mongoose")
import * as fs from "fs";
import { re } from "@babel/core/lib/vendor/import-meta-resolve";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

// these routes are needed so we can forward our routing to separe files ( mainly for the arrangement of the code)
import innovationsRouter from "../routes/Innovations"; // all the routed innovations add, update, delete, and fetching all the data of it
import userRouter from "../routes/Users"; // files needed to make new profile ( registration methods )
import authRouter from "../routes/Auth";
import airportRouter from "../routes/Airport";
import airlineRouter from "../routes/Airline";
import flightRouter from "../routes/Flight";
import paymentRouter from "../routes/Payment";
import employeeRouter from "../routes/Employee";

// firstly we start using our libraries which we needed and add them to our app
const app = express(), // main application which will need for all the routing and database
  port = process.env.PORT || 3000; // the port our application will run on it

// some helpful middleware
// these middlewares are helpful for sending data from the forms to the backend and so on...
app.use(express.urlencoded({ extended: "true" }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
// set the view engine to ejs
// app.set('view engine', 'ejs');
// we need to make our main routes here so if the auth is accepted we will go to these pages
app.get(`/`, (req, res) => {
  // res.sendFile(path.join(__dirname,"../front/sign.js"))
  // res.sendFile(path.join(__dirname,"../front/signin.html"))
});
app.get(`/dashboard`, async (req, res) => {
  // let query ={}
  // query.fn = req.cookies["fn"]
  // query.ln = req.cookies["ln"]
  // query.admin = req.cookies["admin"]
  //  let data =  await fetchData()
  // res.render('dashboard.ejs',{query: query, data: data});
});
function fetchData() {
  return fetch("http://localhost:3000/api/innovations/").then((res) =>
    res.json()
  );
}
app.get(`/signup`, (req, res) => {
  res.sendFile(path.join(__dirname, "../front/signup.html"));
});
app.post(`/addnew`, (req, res) => {
  res.render("add.ejs");
});
// edit cycle
// first fetch data and put inside front end
app.post(`/editInnov`, async (req, res) => {
  let innov = await fetchSpecificInnov(req.body.name);
  res.render("edit.ejs", { innov: innov });
});
function fetchSpecificInnov(name) {
  return fetch("http://localhost:3000/api/innovations/" + name).then((res) =>
    res.json()
  );
}
// second update to database and forward to main dashboard to see the updated data live
app.post(`/editInnovData`, async (req, res) => {
  let innov = req.body;
  // Awaiting fetch which contains method,
  // headers and content-type and body
  put("http://localhost:3000/api/innovations/" + req.body.name, innov)
    // Resolving promise for response data
    .then(res.redirect("/dashboard"))
    // Resolving promise for error
    .catch((err) => console.log(err));
});
async function put(url, data) {
  // Awaiting fetch which contains method,
  // headers and content-type and body
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  // Awaiting response.json()
  const resData = await response.json();
  // Return response data
  return resData;
}
// first delete from database and forward to main dashboard to see the updated data live
app.post(`/deleteInnovData`, async (req, res) => {
  // Awaiting fetch which contains method,
  // headers and content-type and body
  deleting("http://localhost:3000/api/innovations/" + req.body.name)
    // Resolving promise for response data
    .then(res.redirect("/dashboard"))
    // Resolving promise for error
    .catch((err) => console.log(err));
});
async function deleting(url, data) {
  // Awaiting fetch which contains method,
  // headers and content-type and body
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
    },
  });
  // Awaiting for the resource to be deleted
  const resData = "resource deleted...";

  // Return response data
  return resData;
}
// add all users to front end
app.post(`/users`, async (req, res) => {
  let users = await fetchUsersData();
  res.render("users.ejs", { users: users });
});
function fetchUsersData() {
  return fetch("http://localhost:3000/api/user/").then((res) => res.json());
}
// adding new user from admin
app.post(`/addNewUser`, async (req, res) => {
  await addNewUser(
    "http://localhost:3000/api/user/addNewUserFromAdmin",
    req.body
  )
    // Resolving promise for response data
    .then(res.render("users.ejs", { users: await fetchUsersData() }))
    // Resolving promise for error
    .catch((err) => console.log(err));
});
async function addNewUser(url, data) {
  // Awaiting fetch which contains method,
  // headers and content-type and body
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  // Awaiting response.json()
  const resData = "User Added successfully....";
  // Return response data
  return resData;
}
// change user admin or not
app.post(`/makeAdmin`, async (req, res) => {
  await post("http://localhost:3000/api/user/updateToAdminUser", req.body)
    // Resolving promise for response data
    .then(res.render("users.ejs", { users: await fetchUsersData() }))
    // Resolving promise for error
    .catch((err) => console.log(err));
});
app.post(`/removeAdmin`, async (req, res) => {
  await post("http://localhost:3000/api/user/updateToUser", req.body)
    // Resolving promise for response data
    .then(res.render("users.ejs", { users: await fetchUsersData() }))
    // Resolving promise for error
    .catch((err) => console.log(err));
});
async function post(url, data) {
  // Awaiting fetch which contains method,
  // headers and content-type and body
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });
  // Awaiting response.json()
  const resData = await response.json();
  // Return response data
  return resData;
}
// delete user data
app.post(`/deleteUserData`, async (req, res) => {
  // Awaiting fetch which contains method,
  // headers and content-type and body
  deleting("http://localhost:3000/api/user/deleteUser/" + req.body.email)
    // Resolving promise for response data
    .then(res.render("users.ejs", { users: await fetchUsersData() }))
    // Resolving promise for error
    .catch((err) => console.log(err));
});
app.post(`/item`, async (req, res) => {
  let data = await fetchItem(req.body.name);
  res.render("Item", { data: data });
});
function fetchItem(name) {
  return fetch("http://localhost:3000/api/innovations/" + name).then((res) =>
    res.json()
  );
}

app.use(express.static("front"));
app.use(cors({credentials: true}));
// // set mongoose connection
// mongoose.connect("mongodb://localhost:27017/innovation")
//     .then(()=> console.log("connected to DB"))
//     .catch((err)=>{
//       console.log(err)
//     })
//

// use routers and tie all of these together
app.use(`/api/innovations`, innovationsRouter);
app.use(`/api/user`, userRouter);
app.use(`/api/login`, authRouter);
// use routers for airlines and airports
app.use("/api/airport", airportRouter);
app.use("/api/airline", airlineRouter);
// use routers for flights and bookings
app.use("/api/flight", flightRouter);
// use routes for Payments
app.use("/api/payment", paymentRouter);
// user routes for Admins and Employees
app.use("/api/employee", employeeRouter);

// this is the first step of initializing the server while we make the application is listening to specific port
app.listen(port, () => console.log(`Server is listening to port: ${port}`));
