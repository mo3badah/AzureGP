const sequelize = require('./sequelize');
const {DataTypes} = require("sequelize");
const ClientPassport = require("./client_passport");
const ClientPhone = require('./client_phone')
const BiometricsData = require('./biometric_data')
const Childs = require('./childs')
const Ticket = require('./ticket')
const Employee = require('./employee')
const TicketCancel = require("./ticket_cancel");
const Payment = require("./payment");

const Client = sequelize.define('client', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
        primaryKey: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    Fname: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    Mname: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    Lname: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    street:{
        type : DataTypes.STRING(45),
        allowNull : true
    },
    birth:{
        type : DataTypes.DATEONLY,
        allowNull : true
    },
    gender:{
        type : DataTypes.STRING(45),
        allowNull : true
    },
    fullName: {
        type: DataTypes.VIRTUAL,
        get() {
            // set null values to empty string
            if (this.Fname == null) {
                this.Fname = '';
            }
            if (this.Mname == null) {
                this.Mname = '';
            }
            if (this.Lname == null) {
                this.Lname = '';
            }
            return `${this.Fname} ${this.Mname} ${this.Lname}`;
        },
        set(value) {
            throw new Error('Do not try to set the `fullName` value!');
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
    // set full address data from the street and state and country
    fullAddress: {
        type: DataTypes.VIRTUAL,

        get() {
            // set null values to empty string
            if (this.street == null) {
                this.street = '';
            }
            if (this.state == null) {
                this.state = '';
            }
            if (this.country == null) {
                this.country = '';
            }
            return `${this.street}, ${this.state}, ${this.country}`;
        },
        set(value) {
            throw new Error('Do not try to set the `fullName` value!');
        }
    }
});
Client.hasMany(Childs);
Childs.belongsTo(Client);

Client.belongsTo(Client, { as: "link", foreignKey: 'linked_users' });
Client.hasMany(Payment,{ onDelete: 'CASCADE' });
Payment.belongsTo(Client);
Client.hasMany(TicketCancel, { foreignKey: 'client_id' })
TicketCancel.belongsTo(Client, { foreignKey: 'client_id' });
Payment.hasMany(TicketCancel, { foreignKey: 'payment_id' })
TicketCancel.belongsTo(Payment, { foreignKey: 'payment_id' });

Client.hasMany(Ticket, { onDelete: 'CASCADE' });
Ticket.belongsTo(Client);

Client.hasMany(ClientPassport,{ onDelete: 'CASCADE' });
ClientPassport.belongsTo(Client);

Client.hasMany(ClientPhone, { onDelete: 'CASCADE' });
ClientPhone.belongsTo(Client);

Client.hasMany(BiometricsData, { onDelete: 'CASCADE' });
BiometricsData.belongsTo(Client);

Employee.belongsToMany(Client, { through: 'client_employee' });
Client.belongsToMany(Employee, { through: 'client_employee' });

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.sync({
            alter: true
        });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = Client