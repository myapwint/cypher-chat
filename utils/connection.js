import {mongoose} from "mongoose";
import config from "../utils/config.js"

export const connectToDB = async() =>{
    try {
        await mongoose.connect(config.mongoDB);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB", err);
    } finally {
        //await client.close();
    }
};