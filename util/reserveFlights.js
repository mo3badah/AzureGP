const Ajv = require("ajv").default;
const ajv = new Ajv();
const schema = {
  "type": "object",
  "properties": {
    "seats": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
      }
    },
    "users": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "clients": {
            "type": "array",
            "items": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
            }
          },
          "childs": {
            "type": "array",
            "items": {
              "type": "string",
              "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
            }
          }
        },
        "required": ["clients"]
      }
    }
  },
  "required": ["seats", "users"]
}

const validator = ajv.compile(schema);
module.exports = validator;
