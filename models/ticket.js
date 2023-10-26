const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Flight = require('./flight');
const ClassDetails = require('./class_details');
const Seats = require('./seats');

const Ticket = sequelize.define('ticket', {
    ticket_number: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
        primaryKey: true,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    added_lagguge: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

Flight.hasMany(Ticket, {onDelete: 'cascade'});
Ticket.belongsTo(Flight);

ClassDetails.hasMany(Ticket);
Ticket.belongsTo(ClassDetails);

Ticket.hasOne(Seats);
Seats.belongsTo(Ticket);

module.exports = Ticket