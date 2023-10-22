const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// const sequelize = new Sequelize('GraduationProject', 'admin', 'mo3badah2023', {
//     host: 'my-nodejs-database-instance-1.c1dsu1fi8pdh.us-east-1.rds.amazonaws.com',
//     dialect: 'mysql'
// });
const sequelize = new Sequelize(process.env.DATABASE_SCHEMA, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT,
    // dialectOptions: {
    //     ssl: {
    //         ca: fs.readFileSync(path.join(__dirname, 'initialData/DigiCertGlobalRootCA.crt.pem')).toString()
    //     },
    // },
    // connectTimeout: 30000,
});

module.exports = sequelize;
