const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const Airport = require("./airport");

const Employee = sequelize.define('employee', {
    SSN: {
        type: DataTypes.STRING,
        validate: {
            isSSN(value) {
                const ssnPattern = /^(?!000|666)\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/;
                if (!ssnPattern.test(value)) {
                    throw new Error('Invalid SSN format');
                }
            },
        },
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
    Mname: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    password: {
        type: DataTypes.STRING(100),
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
    job_title: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    salary: {
        type: DataTypes.DOUBLE,
        allowNull: true
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

Employee.belongsTo(Employee, { as: "supervisor", foreignKey: 'sup_ssn' });

Airport.hasMany(Employee)
Employee.belongsTo(Airport)


module.exports = Employee
