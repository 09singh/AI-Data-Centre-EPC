import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
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
        default: "Project Manager"
    },
    companyName: {
        type: String,
        required: true
    },
    projectName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;