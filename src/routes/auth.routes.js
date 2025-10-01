import { Router } from "express";
import { userRegisterValidation ,
    userLoginValidation,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    registerUser, 
    loginUser ,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword} from "../controllers/auth.controllers.js";





const router = Router();
//unsecured route
router.route("/register").post(userRegisterValidation(),validate,  registerUser);
router.route("/login").post(userLoginValidation(),validate,loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/reset-password/:verificationToken/:resetToken").post(userResetForgotPasswordValidator(),validate,resetForgotPassword);


//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification);


export default router;