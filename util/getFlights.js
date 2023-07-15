const Ajv = require("ajv").default;
const ajv = new Ajv();
const schema = {
  "type": "object",
  "properties": {
    "airportFrom": {
      "type": "string"
    },
    "airportTo": {
      "type": "string"
    },
    "date": {
      "type": "string",
    },
    "class": {
      "type": "string"
    },
    "no": {
      "type": "integer",
      "minimum": 0
    }
  },
  "required": ["airportFrom", "airportTo", "date", "class", "no"]
}

const validator = ajv.compile(schema);
module.exports = validator;
