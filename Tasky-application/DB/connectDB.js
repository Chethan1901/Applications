import mongoose from "mongoose";

async function connectDB(){
    try {
        await mongoose.connect("mongodb+srv://Chethan:Chethan123@gcp.ublj6oz.mongodb.net/test")
    } catch (error) {
        console.log(error)
    }
}

connectDB();