import mongoose from "mongoose";
interface UserInterface {
    name: string;
    nik: string;
    password: string;
    division: mongoose.Schema.Types.ObjectId;
    presences: mongoose.Schema.Types.ObjectId[];
    isAdmin: boolean;
}
const UserSchema = new mongoose.Schema<UserInterface>(
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
const User = mongoose.model<UserInterface>("User", UserSchema);
export default User;
