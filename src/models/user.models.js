import e from "express";
import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import crypto from "crypto";




const userSchema=new Schema({
    avatar: {
        type: {
        localPath: String,
        url: String,
        },
        default:{
            url:"https://placehold.co/200x200",
            localPath:""
        }
    
    },

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true

    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,


    },

    fullName:{
        type:String,
        // required:true,
    
    },

    password:{
        type:String,
        required:[true, "Password is required"],
        minlength:8,
    },

    isEmailVerified:{
        type:Boolean,
        default:false,
    },

    refreshToken:{
        type:String,
    
    },

    forgotPasswordToken:{
        type:String,
    
    },

    forgotPasswordExpiry:{
        type:Date
    
    },

    emailVerificationToken:{
        type:String,
    
    },

    emailVerificationExpiry:{
        type:Date
    
    },

},{
    timestamps:true,
},);

userSchema.pre("save",async function(next){ // this run when only password is change or modified
    if(!this.isModified("password")) return next();  
    this.password=await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
return jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    
    }
)}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

//token generate without data ,random

userSchema.methods.generateTemporaryToken = function () {
    const unHashToken = crypto
        .randomBytes(20)
        .toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashToken)
        .digest("hex");
    const tokenExpiry= Date.now() + (20 * 60 * 1000) //20m
    return {unHashToken,hashedToken,tokenExpiry};
};

export const User=mongoose.model("User",userSchema);

    
    