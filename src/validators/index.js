import {body} from "express-validator";


const userRegisterValidation = ()=>{
    return [
        body("email")
             .trim()
             .notEmpty()    // email is not empty if empty than it send message
             .withMessage("Email is required")
             .isEmail()  // it check formate of email
             .withMessage("Email is invalid"),
        body("username")
             .trim()
             .notEmpty()
             .withMessage("Username is required")
             .isLowercase()
             .withMessage("Username must be in lowercase")
             .isLength({min:3})
             .withMessage("Username must be at least 3 characters long"),
        body("password")
             .trim()
             .notEmpty()
             .withMessage("Password is required")
             .isLength({min:8})
             .withMessage("Password must be at least 8 characters long"),
        body("fullName")
             .optional()
             .trim()
             
            



];
};

export {userRegisterValidation};