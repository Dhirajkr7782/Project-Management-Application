import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api.response.js";
import { ApiError } from "../utils/api.error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail,emailVerificationMail,forgotPasswordMailgenContent } from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import 'dotenv/config'





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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password , username} = req.body;

    if(!email){
        throw new ApiError(400,"Email is required",[]);

    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found", []);
    }
   const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password", []);
    }
const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
);

const options = {
    httpOnly: true,
    secure: true
}

return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully"));







});


const logoutUser = asyncHandler(async (req, res) => {
 
    await User.findByIdAndUpdate(
        req.user._id, 
        { 
            $set: {
                refreshToken: "", 
            },
        },
        {
            new: true,
        }
        
    );
   const options = {
    httpOnly: true,
    secure: true
}
return res
        .status(200)
        .clearCookie("refreshToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out successfully"));


});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
         .status(200)
         .json(
            new ApiResponse(
                200, req.user , "Current user fetched successfully"
            )
        )
});

const verifyEmail = asyncHandler(async (req, res) => {

    const { verificationToken } = req.params;
    if(!verificationToken)
    {
        throw new ApiError(400,"Verification token is required");
    
    }

    let hashedToken=crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");


    const user = await User.findOne({
    emailVerificationToken:hashedToken,
    emailVerificationExpiry:{$gt:Date.now()}

   })

   if(!user)
   {
    throw new ApiError(400,"Invalid verification token");

   }
   user.isEmailVerified=true;
   user.emailVerificationToken=undefined;
   user.emailVerificationExpiry=undefined;
   await user.save({validateBeforeSave:false});


   return res
         .status(200)
         .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true
                },
                "Email verified successfully"
            )
        )
});

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404,"User not found");
    }
    if(user.isEmailVerified){
        throw new ApiError(400,"Email is already verified");
    }

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
   return res
         .status(200)
         .json(
            new ApiResponse(
                200,
                {},
                "Email verification resent successfully"
            )
        )

});

const refreshAccessToken = asyncHandler(async (req, res) => {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if(!incomingRefreshToken)
      {
        throw new ApiError(400,"Unauthorized access");

      }

      try{
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id)
        if(!user)
        {
            throw new ApiError(404,"Invalid refresh token");
        }
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"Refresh token in expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const  {accessToken,refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);
        user.refreshToken=newRefreshToken;
        await user.save();
        return res
        .status(200)
        .cookie("refreshToken", newRefreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,{refreshToken:newRefreshToken,accessToken},"Access token refreshed successfully"
           )
        
        )
   }catch(err){
    throw new ApiError(401,"Invalid refresh token");
   }

}
);

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

   if(!user)
   {
    throw new ApiError(404,"User not found");
   }
   const {unHashToken,hashedToken,tokenExpiry}= user.generateTemporaryToken();

   user.forgotPasswordToken=hashedToken;

   user.forgotPasswordExpiry=tokenExpiry;

   await user.save({validateBeforeSave:false});

   await sendEmail({
    email:user?.email,
    subject:"Reset your password",
    mailgenContent:forgotPasswordMailgenContent(user.username, 
        `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashToken}`),

});

return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password reset mail has been sent to your email"
        )
    )
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const {newPassword} = req.body;


    let hashedToken=crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

    const user = await User.findOne({
    forgotPasswordToken:hashedToken,
    forgotPasswordExpiry:{$gt:Date.now()}

   })
      if(!user)
   {
    throw new ApiError(400,"Token is invalid or has expired");

   }
user.forgotPasswordExpiry=undefined;
user.forgotPasswordToken=undefined;
user.password=newPassword;
await user.save({validateBeforeSave:false});

return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password reset successfully"
        )
    )
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password", []);
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res  
         .status(200)
         .json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully"
            )
        )
});











export { 
    registerUser, 
    loginUser ,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword


};