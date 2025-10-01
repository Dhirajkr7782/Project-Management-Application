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

const userLoginValidation = ()=>{
    return [
        body("email")
             .trim()
             .notEmpty()
             .withMessage("Email is required")
             .isEmail()
             .withMessage("Email is invalid"),
         body("password")
             .trim()
             .notEmpty()
             .withMessage("Password is required")
    ];
};

const userChangeCurrentPasswordValidator= ()=>{
    return [
        body("oldPassword")
              .notEmpty()
              .withMessage("Old password is required"),

        body("newPassword")
               .notEmpty()
               .withMessage("New password is required"),
        
    ];
};

const userForgotPasswordValidator= ()=>{
    return [
        body("email")
              .notEmpty()
              .withMessage("Email is required")
              .isEmail()
              .withMessage("Email is invalid"),
    ];
};

const userResetForgotPasswordValidator= ()=>{
     return [
          body("newPassword")
               .notEmpty()
               .withMessage("New password is required"),
          
     ];
};


export {
     userRegisterValidation,
     userLoginValidation,
     userChangeCurrentPasswordValidator,
     userForgotPasswordValidator,
     userResetForgotPasswordValidator



};