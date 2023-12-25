const _ = require("lodash");
const httpStatus = require("http-status");
const { usersLogger } = require("./../utils/logger");
const User = require('./../models/user.model');


module.exports = async ( req, res, next) => {
  try {
    let { phone,email } = req.body;

    //check if user already exists or not
    let isUserExists = await User.findOne({email}).lean();
    if(isUserExists) {
      return res.send({
        status: httpStatus.CONFLICT,
        message: "User already exists, please try with a different email !",
      });
    }
    // return;
    if(_.isEmpty(phone)) {
      usersLogger.error('Please provide a phone number !')
      return res.status(httpStatus.BAD_REQUEST).send({
        status: httpStatus.BAD_REQUEST,
        message: "Please provide the phone of the user !",
      });
    }
    next();
  
    
  } catch (err) {
    console.log(err);
    usersLogger.error(`${err}`);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME']});
  }
};
