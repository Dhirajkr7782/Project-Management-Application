import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api.response.js";
import { ApiError } from "../utils/api.error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail,emailVerificationMail } from "../utils/mail.js";




const generateAccessAndRefreshToken = async (userId) => {
    try{
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
    }catch(err){
        throw new ApiError( 500,"Something went wrong while generating access and refresh token",[]);
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password,fullName } = req.body;

    const existedUser = await User.findOne({$or:[{ email },{username}]});

    if (existedUser) {
        throw new ApiError(409,"User with email or username already exists",[])
    }
    const user = await User.create({
        username,
        email,
        password,
        fullName,
        isEmailVerified: false
    });

   const {unHashToken,hashedToken,tokenExpiry}= user.generateTemporaryToken();

   user.emailVerificationToken=hashedToken;

   user.emailVerificationExpiry=tokenExpiry;

   await user.save({validateBeforeSave:false});

   await sendEmail({
    email:user?.email,
    subject:"Please verify your email",
    mailgenContent:emailVerificationMail(user.username, 
        `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashToken}`),
    
    
});

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
);

if(!createdUser){
    throw new ApiError(500,"Something went wrong while Registering user")
}
return res
   .status(201)
   .json(new ApiResponse(201,{user:createdUser},"User registered uccessfully and verification email has been sent on your email"));


});

// const loginUser = asyncHandler(async (req, res) => {
// });


export { registerUser};