const User = require("../models/user.model");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const {
  AUTH_TOKEN_MISSING_ERR,
  AUTH_HEADER_MISSING_ERR,
  JWT_DECODE_ERR,
  USER_NOT_FOUND_ERR,
} = require("./../error");
const { verifyJwtToken } = require("../utils/token.util");

module.exports = async (req, res, next) => {
  try {
    if (req.headers["x-access-token"] === undefined) {
      return res.send({
        status: httpStatus.FORBIDDEN,
        message: AUTH_HEADER_MISSING_ERR,
      });
    }
    const token = req.headers["x-access-token"];

    if (!token) {
      return res.send({
        status: httpStatus.FORBIDDEN,
        message: AUTH_TOKEN_MISSING_ERR,
      });
    }

    // check if token is valid or not
    let isTokenValid = await User.findOne({ token }).lean();
   
    if (!isTokenValid) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: httpStatus.BAD_REQUEST,
        message:
          "Please pass a valid token. It is either expired or deactivated !",
      });
    }
    const userId = await verifyJwtToken(req,res,token);
    
    if (!userId) {
      return res.send({
        status: httpStatus.FORBIDDEN,
        message: JWT_DECODE_ERR,
      });
    }
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.send({
        status: httpStatus.NOT_FOUND,
        message: USER_NOT_FOUND_ERR,
      });
    }
    // console.log("--------------------------------",user);
    res.locals.user = user;
    next();
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: httpStatus["500_NAME"],
      });
  }
};
