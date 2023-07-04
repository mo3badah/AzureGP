const Ajv = require("ajv").default;
const ajv = new Ajv();
const schema = {
  type: "object",
  properties: {
    Fname: { type: "string", pattern: "^[A-Za-z][a-z]*$" },
    Mname: { type: "string", pattern: "^[A-Za-z][a-z]*$" },
    Lname: { type: "string", pattern: "^[A-Za-z][a-z]*$" },
    email: { type: "string", pattern: ".+@.+..+" },
    password: { type: "string" },
    country: { type: "string" },
    state: { anyOf: [{ type: "string" }, { type: "null" }] },
    street: { type: "string" },
    gender: { type: "string" },
    birth: { type: "string"
      // , isDate: true
    },
    
    phone: { type: "string" },
    passport: { type: "string" },
  },
  required: ["Fname", "Lname", "email", "password"],
};
const validator = ajv.compile(schema);
module.exports = validator;
