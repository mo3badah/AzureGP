const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Ticket = require('./ticket');

const Childs = sequelize.define('childs', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
        primaryKey: true,
        allowNull: false
    },
    Fname: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    Lname: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    birth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    passport: {
        type: DataTypes.STRING(45),
        allowNull: true,
        unique: false
    },
    fullName: {
        type: DataTypes.VIRTUAL,
        get() {
            // set null values to empty string
            if (this.Fname == null) {
                this.Fname = '';
            }
            if (this.Lname == null) {
                this.Lname = '';
            }
            return `${this.Fname} ${this.Lname}`;
        }
    },
    age: {
        // this function to get the age from the birthdate without further calculations for every time
        type: DataTypes.VIRTUAL,
        get() {
            let today = new Date();
            let birthDate = new Date(this.birth);
            let age = today.getFullYear() - birthDate.getFullYear();
            let m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
    },
});

Ticket.belongsToMany(Childs, { through: 'ticket_childs' , timestamps: false});
Childs.belongsToMany(Ticket, { through: 'ticket_childs' , timestamps: false});


module.exports = Childs;
