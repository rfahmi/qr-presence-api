import mongoose from "mongoose";

const PresenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    isLate: {
        type: Boolean,
        required: true,
    },
    lateDurationMin: {
        type: Number,
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

export default mongoose.model("Presence", PresenceSchema);
