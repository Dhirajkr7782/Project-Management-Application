import e from "express";
import mongoose,{Schema} from "mongoose";
import brcrypt from "bcrypt";


const UserSchema=new Schema({
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
        required:true,
    
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

UserSchema.pre("save",async function(next){ // this run when only password is change or modified
    if(!this.isModified("password")) return next();  
    this.password=await brcrypt.hash(this.password,10);
    next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await brcrypt.compare(password, this.password);
  };



export const User=mongoose.model("User",UserSchema);
    
    