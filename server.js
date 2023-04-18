import app from "./app.js";
import { conncectDB } from "./config/database.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodecron from "node-cron";
import { Stats } from "./models/Stats.js";

conncectDB();

cloudinary.v2.config({
     cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
     api_key:process.env.CLOUDINARY_CLIENT_APIKEY,
     api_secret:process.env.CLOUDINARY_CLIENT_APISECRET
});

export const instance = new Razorpay({
     key_id:process.env.RAZORPAY_KEY_ID,
     key_secret:process.env.RAZORPAY_SECRET,

});

nodecron.schedule("0 0 0 1 * *",async()=>{
   try{
     await Stats.create({});
   }catch(error){
     console.log(err);
   }
})

app.listen(process.env.PORT,()=>{
     console.log(`server is woring on port ${process.env.PORT}`)
});