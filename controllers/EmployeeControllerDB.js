const Employee = require("../models/employee");
const Airport = require("../models/airport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let postNewEmployee = async (req, res) => {
    try{
        let employee = await Employee.findOne({where: {email: req.body.email}});
        if (employee) return res.status(400).send(`Employee with this email: ${req.body.email} is already exist`);
        let salt = await bcrypt.genSalt(10);
        let hashPswd = await bcrypt.hash(req.body.password, salt);
        let newEmployee = await Employee.create({
            SSN: generateSSN(),
            Fname: req.body.Fname,
            Mname: req.body.Mname,
            Lname: req.body.Lname,
            email: req.body.email,
            password: hashPswd,
            address: req.body.address,
            gender: req.body.gender,
            birth: req.body.birth,
            phone: +req.body.phone,
            salary: +req.body.salary,
            job_title: req.body.job_title,
        }
        );
        let sup = await Employee.findOne({where: {SSN: req.body.sup_ssn}});
        if (sup) await newEmployee.setSupervisor(sup);
        let AP = await Airport.findOne({where: {AP_name: req.body.airport_name}});
        if (AP) await newEmployee.setAirport(AP);
        let token = jwt.sign({empSSN: newEmployee.SSN}, "myJsonWebTokenSecretKeyIsHere");
        res.header("x-auth-token", token);
        // res.status(200).send(`Ok Employee: ${req.body.Fname} ${req.body.Lname} registered with email: ${req.body.email}`);
        res.status(200).send(token);
    }catch (e) {
        for (let err in e.errors) {
            console.log(e.errors[err].message);
        }
        res.status(400).send(`Bad Request...`);
    }
}
let getAllEmployees = async (req, res) => {
    try{
        let employees = await Employee.findAll();
        if (!employees) return res.status(404).send("Employees data are not found...");
        res.send(employees);
    }catch (e) {
        for (let err in e.errors) {
            console.log(e.errors[err].message);
        }
        res.status(404).send("Employees data are not found...");
    }
}
let adminLogin = async (req, res) => {
    try {
        let employee = await Employee.findOne({where: {SSN: req.body.SSN}});
        if (!employee) return res.status(400).send("Invalid SSN or Password please try again");
        const validPswd = await bcrypt.compare(req.body.password, employee.password);
        if (!validPswd) return res.status(400).send("Invalid SSN or Password...");
        let token = jwt.sign({empSSN: employee.SSN, job_title: employee.job_title}, "myJsonWebTokenSecretKeyIsHere");
        res.header("x-auth-token", token);
        const query = {
            "name": employee.fullName,
            "job_title": employee.job_title,
            "SSN": employee.SSN
        }
        for (let propName in query) {
            res.cookie(propName, query[propName],2*24*60*60)
        }
        // res.status(200).send(`The Employee ${employee.fullName} signed in successfully.`)
        res.status(200).send(token)
    }catch (e) {
        res.status(400).send(`Bad Request...`);
        console.log("there is some errors on the config file configuration :"+e)
    }
}

function generateSSN() {
    let ssn = '';

    // Generate the first three digits (area number)
    const areaNumber = Math.floor(Math.random() * 900) + 100;
    ssn += areaNumber.toString() + "-";

    // Generate the next two digits (group number)
    const groupNumber = Math.floor(Math.random() * 90) + 10;
    ssn += groupNumber.toString() + "-";

    // Generate the last four digits (serial number)
    const serialNumber = Math.floor(Math.random() * 9000) + 1000;
    ssn += serialNumber.toString();

    // Return the generated SSN
    return ssn;
}
module.exports = {
    postNewEmployee,
    getAllEmployees,
    adminLogin
}