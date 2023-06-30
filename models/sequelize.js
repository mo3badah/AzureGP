const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('GraduationProject', 'admin', 'mo3badah2023', {
    host: 'my-nodejs-database-instance-1.c1dsu1fi8pdh.us-east-1.rds.amazonaws.com',
    dialect: 'mysql'
});

module.exports = sequelize;
