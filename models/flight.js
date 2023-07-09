const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Stops = require('./stops');
const Type = require('./type');

const Flight = sequelize.define('flight', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
        primaryKey: true,
        allowNull: false
    },
    flight_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    take_off_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    take_off_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    duration: {
        type: DataTypes.TIME,
        allowNull: true
    },
    no_of_stops:{
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

Flight.hasMany(Stops);
Stops.belongsTo(Flight);

Type.hasMany(Flight);
Flight.belongsTo(Type);

module.exports = Flight