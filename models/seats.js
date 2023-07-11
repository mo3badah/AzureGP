const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Seats = sequelize.define('seats', {
    seat_no: {
        type: DataTypes.STRING(3),
        allowNull: false,
    },
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    status: {
        type: DataTypes.VIRTUAL,
        get() {
            if (this.get("ticketTicketNumber") === null) {
                return 'available';
            } else {
                return 'not available';
            }
        }
    }
})


module.exports = Seats;