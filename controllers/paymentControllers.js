import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import { instance } from "../server.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "crypto";
import {Payment} from "../models/Payment.js";


export const buySubscription = catchAsyncError(async(req,res,next)=>{
    
    const user=await User.findById(req.user._id);
    if(user.role==='admin')return next(new ErrorHandler("Admin don't need subscription ",404));
    const plan_id=process.env.PLAN_ID || "plan_jujevKAcuZdtRO";
    const subscription=await instance.subscriptions.create({
        plan_id,
        customer_notify:1,
        total_count:12,
    });
    user.subscription.id=subscription.id;
    user.subscription.status=subscription.status;
    await user.save();
    res.status(200).json({
        success:true,
        subscriptionId:subscription.id,
    })
});

// payment verification 

export const paymentVerification = catchAsyncError(async(req,res,next)=>{

    const {razorpay_signature,razorpay_payment_id,razorpay_subscription_id} = req.body;

    const user=await User.findById(req.user._id);
    
    const subscription_id=user.subscription.id;
    const generated_signature=crypto.createHash(
        "sha256",
        process.env.RAZORPAY_SECRET,
    ).update(razorpay_payment_id+"|"+subscription_id,"utf-8")
    .digest("hex");

    const isAuthentic= generated_signature===razorpay_signature;
    if(!isAuthentic)return res.redirect(`${process.env.FRONT_END_URL}/paymentfailed`);

    // if authentic add to db
    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id,
    })

    user.subscription.status="active";
    await user.save();
 
    res.redirect(`${process.env.FRONT_END_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
});

export const getRazorPayKey=catchAsyncError(async(req,res,next)=>{
    res.status(200).json({
        success:true,
        key:process.env.RAZORPAY_KEY_ID,
    });
});

// cancel subscription

export const cancelSubscription = catchAsyncError(async(req,res,next)=>{

    const user=await User.findById(req.user._id);
    
    const subscriptionId=user.subscription.id;

    let refund=false;

    await instance.subscriptions.cancel(subscriptionId);
    const payment=Payment.findOne({
        razorpay_subscription_id:subscriptionId,
    });
    const gap=Date.now().payment.createdAt;
    const refendTime=process.env.REFUND_DAYS*24*60*60*1000;

    if(refendTime>gap){
        await instance.payments.refund(payment.razorpay_payment_id);
        refund=true;
    }
    
    await payment.deleteOne();
    user.subscription.id=undefined;
    user.subscription.status=undefined;
    await user.save();

    res.status(200).json({
        succcess:true,
        message:refund ?"subscription cancelled you will recieve your refund amount with in 7 days":
        "subscription cancelled no refund initiated as subscription cancelled after 7 days ",
    })
 
});