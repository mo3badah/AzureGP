const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

const ClientPhone = sequelize.define('ClientPhone', {
    phone: {
        type: Sequelize.STRING(20),
        allowNull: false
    }
}, {
    tableName: 'client_phone',
    onDelete: 'CASCADE',
    timestamps: false,
});


module.exports = ClientPhone;
