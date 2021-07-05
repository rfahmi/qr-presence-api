const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    nik: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        default: "",
    },
    divisionId: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
