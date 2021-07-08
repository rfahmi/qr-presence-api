import mongoose from "mongoose";
interface PresenceInterface {
    user: mongoose.Schema.Types.ObjectId;
    isLate: boolean;
    lateDurationMin: number;
    timestamp: mongoose.Schema.Types.Date;
    type: string;
    photo: string;
}
const PresenceSchema = new mongoose.Schema<PresenceInterface>({
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
const Presence = mongoose.model<PresenceInterface>("Presence", PresenceSchema);

export default Presence;
