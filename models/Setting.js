const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
    uangMakan: {
        type: Number,
        required: true,
    },
    dendaTelat: {
        type: Number,
        required: true,
    },
    kelipatanTelatMin: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Setting", SettingSchema);
