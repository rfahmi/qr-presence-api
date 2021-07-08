import mongoose from "mongoose";
interface DivisionInterface {
    name: string;
}
const DivisionSchema = new mongoose.Schema<DivisionInterface>(
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
const Division = mongoose.model<DivisionInterface>("Division", DivisionSchema);
export default Division;
