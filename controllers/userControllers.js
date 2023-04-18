import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import {User} from "../models/User.js"
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";

 export const register = catchAsyncError(async(req,res,next)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password) return next(new ErrorHandler("Please Enter all fields..",400));
    
    let user = await User.findOne({email});
    if(user){
        return next(new ErrorHandler("user already exists ",409));
    }

    // upload file on cloudinary..
    
    const file=req.file;
    const fileUri=getDataUri(file);
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        }
    });
    sendToken(res,user,"Registered succesfully ",201);
   
 });

 export const login = catchAsyncError(async(req,res,next)=>{
    const {email,password} = req.body;
    // const file=req.file;
    if(!email || !password) return next(new ErrorHandler("Please Enter all fields..",400));
    
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Incorrect Email or password ",401));
    }
    
    const isMAtch = await user.comparePassword(password);
    if(!isMAtch){
        return next(new ErrorHandler("Incorrect Email or password",401));
    }
    sendToken(res,user,`Welcome back !! ${user.name}`,200);
   
 });

 export const logout = catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
    }).json({
        success:true,
        message:"logged out successfully"
    })
 })

 export const getMyProfile = catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    res.status(200).json({
        success:true,
        user
    })
 })

//  change password...

 export const changePassword = catchAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword} = req.body;

    if(!oldPassword || !newPassword){
        return next(new ErrorHandler("please enter all fields.",400));
    }
    const user=await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(oldPassword);

    if(!isMatch) return next(new ErrorHandler("Incorrect old password ",400));
    
    user.password=newPassword;

    await user.save();
    res.status(200).json({
        success:true,
        message:"password updated !! "
    })
 }) 

//  update profile

export const updateProfile = catchAsyncError(async(req,res,next)=>{
    const {name,email} = req.body;
    const user=await User.findById(req.user._id).select("+password");
    if(name)user.name=name;
    if(email)user.email=email;
    await user.save();
    res.status(200).json({
        success:true,
        message:"profile updated !! "
    })
 });

//  update profile picture

export const updateProfilePicture = catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    const file=req.file;
    const fileUri=getDataUri(file);
    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar={
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    }
    await user.save();   
    res.status(200).json({
        success:true,
        message:"profile picture updated !! "
    })
 });

 export const forgetPassword = catchAsyncError(async(req,res,next)=>{
    const {email} = req.body;
    const user=await User.findOne({email});
    if(!user){
        return next(new ErrorHandler("user not found",400));
    }

    const resetToken = await user.getResetToken();
    await user.save();

    // send token via email...

    const url=`${process.env.FRONT_END_URL}/resetpassword/${resetToken}`;
    const message=`click on the link to reset your password ${url} 
    if you have not req to change password then kindly ignore the message `;

    await sendEmail(user.email,"Your tutor reset password",message);

    res.status(200).json({
        success:true,
        message:`reset token has been sent to ${user.email}`
    })
 });

 export const resetPassword = catchAsyncError(async(req,res,next)=>{
    const {token} = req.params;
    
    const resetPasswordToken=crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now(),
        },
    })

    if(!user){
        return next(new ErrorHandler("Token is invalid/Expired"))
    }
    user.password=req.body.password;
    user.resetPasswordExpire=null;
    // user.resetPasswordToken=null;
    await user.save();

    res.status(200).json({
        success:true,
        message:"password changed !! "
    })
 });

//  AddTOPlaylist..

export const addToPlayList = catchAsyncError(async(req,res,next)=>{

    res.status(200).json({
        success:true,
        message:"Added to playlist !! "
    })
 });

//  removeFromPlaylist..

export const removeFromPlayList = catchAsyncError(async(req,res,next)=>{

    res.status(200).json({
        success:true,
        message:"Added to playlist !! "
    })
 });

//  admin controllers...

export const getAllUsers = catchAsyncError(async(req,res,next)=>{
    const users=await User.find({});
    res.status(200).json({
        success:true,
        users
    })
 });


 export const updateUserRole = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user)return next(ErrorHandler("User not found ",404));
    if(user.role==='user'){
        user.role='admin';
    }else{
        user.role='user';
    }

    await user.save();

    res.status(200).json({
        success:true,
        message:"user role updated successfully "
    })
 }); 

//  delete USer...

 export const deleteUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user)return next(ErrorHandler("User not found ",404));
    
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    
    await user.deleteOne();

    res.status(200).json({
        success:true,
        message:"user deleted successfully "
    })
 });
 
//  delete my profile...

 export const deleteMyProfile = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id);
    
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    
    await user.deleteOne();

    res.status(200).cookie("token",null,{
        expires: new Date(Date.now()),
    }).json({
        success:true,
        message:"user deleted successfully "
    })
 }); 

//  watcher

User.watch().on("change",async()=>{
    const stats=await Stats.find({}).sort({createdAt:"desc"}).limit(1);

    const subscription=await User.find({"subscription.status":"active"});

    stats[0].subscriptions=subscription.length;
    stats[0].users=User.countDocuments();
    stats[0].createdAt=new Date(Date.now());
    await stats[0].save();

})