import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    projectname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Admin", "Engineer", "QA", "Project Manager"],
    },
    companyName: {
        type: String,
        default: null,
},
});
const User = mongoose.model("User", userSchema);
export default User;
