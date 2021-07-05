const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Division", DivisionSchema);
