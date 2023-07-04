const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

const ClientPassport = sequelize.define('client_passport', {
    passport: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
    }
}, {
    tableName: 'client_passport',
    timestamps: false,
});



module.exports = ClientPassport;
