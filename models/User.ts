import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
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
        division: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Division",
        },
        presences: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Presence",
            },
        ],
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", UserSchema);
