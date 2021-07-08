import mongoose from "mongoose";
interface SettingInterface {
    uangMakan: number;
    dendaTelat: number;
    kelipatanTelatMin: number;
}
const SettingSchema = new mongoose.Schema<SettingInterface>({
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
const Setting = mongoose.model<SettingInterface>("Setting", SettingSchema);
export default Setting;
