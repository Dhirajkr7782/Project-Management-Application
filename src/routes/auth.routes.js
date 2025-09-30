import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { userRegisterValidation } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";




const router = Router();

router.route("/register").post(userRegisterValidation(),validate,  registerUser);
// router.route("/login").post(loginUser);

export default router;