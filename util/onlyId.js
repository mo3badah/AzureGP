const Ajv = require("ajv").default;
const ajv = new Ajv();
const schema = {
  type: "object",
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
    }
  },
  "required": ["id"]
}
const validator = ajv.compile(schema);
module.exports = validator;
