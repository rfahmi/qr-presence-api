import mongoose from "mongoose";

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

export default mongoose.model("Setting", SettingSchema);
