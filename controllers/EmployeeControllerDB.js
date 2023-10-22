const Employee = require("../models/employee");
const Airport = require("../models/airport");
const bcrypt = require("bcrypt");
const {AUTH_MAX_AGE} = process.env;
const jwt = require("jsonwebtoken");
const {generateToken} = require("../config/jwt");

let postNewEmployee = async (req, res) => {
    try{
        let employee = await Employee.findOne({where: {email: req.body.email}});
        if (employee) return res.status(401).json({ error:`Employee with this email: ${req.body.email} is already exist`});
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
        if (req.body.sup_ssn) {
            let sup = await Employee.findOne({where: {SSN: req.body.sup_ssn}});
            if (sup) await newEmployee.setSupervisor(sup);
        }
        if (req.body.airport_name){
            let AP = await Airport.findOne({where: {AP_name: req.body.airport_name}});
            if (AP) await newEmployee.setAirport(AP);
        }
        let payload = {
            SSN: newEmployee.SSN,
            fullName: newEmployee.fullName,
            job_title: newEmployee.job_title
        }
        const token = await generateToken(payload);
        payload.token=token
        res.cookie('token', token, {
            httpOnly: false,
            maxAge: AUTH_MAX_AGE,
        });
        res.status(200).send(payload);
    }catch(error) {
        return res.status(400).json({ error: error });
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
        if (!employee) return res.status(401).json({ error:"Invalid SSN or Password please try again"});
        const validPswd = await bcrypt.compare(req.body.password, employee.password);
        if (!validPswd) return res.status(401).json({ error:"Invalid SSN or Password..."});
        let payload = {
            SSN: employee.SSN,
            fullName: employee.fullName,
            job_title: employee.job_title
        }
        const token = await generateToken(payload);
        payload.token=token
        res.cookie('token', token, {
            httpOnly: false,
            maxAge: AUTH_MAX_AGE,
        });
        res.status(200).send(payload);
    }catch(error) {
        return res.status(400).json({ error: error });
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