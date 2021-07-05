const mongoose = require("mongoose");

const PresenceSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
    },
});

module.exports = mongoose.model("Presence", PresenceSchema);
