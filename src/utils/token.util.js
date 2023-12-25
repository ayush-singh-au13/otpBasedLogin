const {
  NOT_EXTENDED,
  REQUEST_HEADER_FIELDS_TOO_LARGE,
} = require("http-status");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { JWT_DECODE_ERR } = require("./../error");

exports.createJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: 86400 });
  return token;
};

exports.verifyJwtToken = async (req, res, token) => {
  try {
    let { userId } = jwt.verify(token, process.env.SECRET);
    // console.log(decoded);
    // jwt.verify(token,process.env.SECRET, (err, decoded) => {
    //     if(err) {
    //         console.log("------->",err);
    //         return res.status(401).send({status:401, message:'Token expired'})
    //     }else {
    //         return decoded;
    //     }
    // });
        
    //    await jwt.verify(token,process.env.SECRET,function(err,decoded) {
    //         if(err) {
    //             console.log(err);
    //              throw new Error('Token is Expired');
    //         }else {
    //             console.log(decoded,"hellloooo")
    //             return decoded;
    //         }
    // });
    return userId;
  } catch (e) {
    throw new Error(e);
  }
};
