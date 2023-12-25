const Joi  = require('joi');
const {usersLogger} = require('./../utils/logger');
const httpStatus = require('http-status');


// const { body } = req;
function errors(req,res,msg) {
    return  res.status(422).send({status:422, message:msg});
}
// register exports
exports.joiValidInputs = (req,res,next) =>{
    try {
        const { body } = req;
        const schema = Joi.object().keys({
            firstName: Joi.string().min(1).required(),
            lastName: Joi.string().min(1).required(),
            email:Joi.string().required().email(),
            phone: Joi.string().min(10).regex(/^[0|91]?[6-9][0-9]{9}$/).required(),
            accountNo: Joi.string().required()
        }).required();
        const result = schema.validate(body);
        const {value, error}  =result;
      if(error) {
            let { details } = error;
            usersLogger.error(details[0].message);
            return errors(req,res,details[0].message);  
        
        }else {
            next();
        }
    }catch(err){
         usersLogger.error(`${err}`);
         return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME'] });
        
    }
}

exports.joiValidatePhone = (req,res,next) => {
    let { body } = req;
    const schema = Joi.object().keys({
        phone:Joi.string().min(10).regex(/^[0|91]?[6-9][0-9]{9}$/).required()
    });

    let result = schema.validate(body);
    let { value, error } = result;
    if(error) {
        let { details } = error;
        usersLogger.error(details[0]);
        errors(req,res,details[0].message);  
        return;
    }else {
        return next();
    }
    
}

exports.joiValidateEmail = (req,res,next) => {
    let { body } = req.body;
    const schema = Joi.object().keys({
        email: Joi.string().min(3).email()
    });

    let result = schema.validate(body);
    let { value, error } = result;

    if(error) {
        let { details } = error;
        errors(req,res,details[0].message);  
        return;
    }else {
        next();
    }
}

exports.joiValidateOTP = (req,res,next) => {
    try{
        let { body} = req;
        const schema = Joi.object().keys({
            otp: Joi.string().required(),
            // userId:Joi.ObjectId().required()
        });
        const result = schema.validate(body);
        const {value, error} = result;
        if(error) {
            const {details} = error;
            usersLogger.error(`${err}`);
            return errors(req,res,details[0].message);
        }else {
            console.log("helllooooooo")
            return next();
        }
    }catch(err) {
        usersLogger.error(`${err}`);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME']});
    }
}