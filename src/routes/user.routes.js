const express = require("express");
const ctrl = require("../controllers/auth.controller");
const router = express.Router();
const isValid = require("./../middlewares/isValid");
const checkAuth = require("../middlewares/checkAuth");
const checkAdmin = require("../middlewares/checkAdmin");
const {
  joiValidInputs,
  joiValidatePhone,
  joiValidateEmail,
  joiValidateOTP,
} = require("./../validators/validations");
// const apicache = require('apicache');
// const clearCache = require('../middlewares/clearCache')

// let cache = apicache.middleware;

/**
 * @POST AUTH REGISTER,
 */

router.post("/register", [joiValidInputs], isValid, ctrl.createNewUser);
/**
 * @POST OTP BASED LOGIN
 */

router.post("/login", [joiValidatePhone], isValid, ctrl.loginWithPhoneOtp);

/**
 * @POST verify OTP
 */

router.post("/loginwithemail", [joiValidateEmail], ctrl.loginWithEmail);

router.post(
  "/verifyOTP/:userId",
  // [joiValidateOTP],
  ctrl.verifyPhoneOtp
);

/**
 * @GET current user
 */
router.get("/getUser", checkAuth, ctrl.getUserDetails);

//logout

router.patch("/logout", ctrl.logout);

// delete a user by its id
router.delete("/deleteById/:userId", checkAuth, ctrl.deleteByMobile);

// list of all users

router.get("/usersList", checkAuth, checkAdmin, ctrl.usersList);

module.exports = router;
