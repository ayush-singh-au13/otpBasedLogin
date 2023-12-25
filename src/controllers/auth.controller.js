const User = require('./../models/user.model');
const httpStatus = require('http-status');
const messages = require('./../error');
const _ = require('lodash');
const { generateOTP, fast2sms,otpGenerator } = require('./../utils/otp.util');
const { pascalCase } = require('pascal-case');
const { createJwtToken } = require('../utils/token.util');
const { USER_NOT_FOUND_ERR } = require('./../error');
const sendEmail = require('../services/sendEmail');
const { htmlToText } = require('html-to-text');
const { usersLogger, exceptionsLogger } = require('./../utils/logger');
const { default: mongoose } = require('mongoose');
const Account = require('./../models/account.model');



// ----------------------- create user ------------------------------

exports.createNewUser = async (req, res,next) => {
    try {
        let {phone, firstName,lastName,email,accountNo} = req.body;
        let fullName = pascalCase(firstName.trim()) + " " + pascalCase(lastName.trim());

        // check if phone already exists
        let isPhoneExists = await User.findOne({phone}).lean();
        if(!_.isEmpty(isPhoneExists)) {
            return res.send({status:httpStatus.BAD_REQUEST, message:messages.PHONE_ALREADY_EXISTS_ERR})
        }
        const createUser = new User({
            phone: phone,
            firstName:firstName,
            lastName: lastName,
            fullName: fullName,
            email:email,
            role: phone == process.env.ADMIN_PHONE ? 'ADMIN':"USER",
            accountNo:accountNo
        });

        const user = await createUser.save();
      
        // const otp = await generateOTP(6);
        if(!_.isEmpty(user)) {
            await Account.create({
                fullName: fullName,
                accountNo: accountNo
            })
            usersLogger.info(`User Created !,
            {'user_id': ${user._id}}`);
            return res.status(httpStatus.CREATED).send({status:httpStatus.CREATED,message:"User has been successfully registered !",
            data:user
           })
        }else {
            usersLogger.error('Failed to create a user !')
            return res.status(httpStatus.CONFLICT).send({status:httpStatus.CONFLICT,message:"Failed to create a new user !"})

        }
        

    }catch(e) {
        console.log(e);
        usersLogger.error(`${e}`)
        // exceptionsLogger.exceptions.handle();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR, message:httpStatus['500_NAME']})

    }
}

// ---------------------- login user via otp ----------------------

exports.loginWithPhoneOtp = async (req,res,next) => {
    try {
        let {phone} = req.body;
        let user = await User.findOne({phone});
        if(_.isEmpty(user)) {
            usersLogger.error(`400 || ${res.statusMessage} : ${messages.PHONE_NOT_FOUND_ERR} : ${req.originalUrl} : ${req.method}`);
            return res.status(httpStatus.CONFLICT).send({status:httpStatus.CONFLICT,message:messages.PHONE_NOT_FOUND_ERR});
        }
        let otp = await generateOTP(6);
        res.status(httpStatus.OK).send({status:httpStatus.OK,message:"Otp send to your registered mobile number !",
            data:{
                userId: user._id,
                otp:otp
            }});
        // saving otp to the DB
        user.phoneOtp = otp;
        user.isAccountVerified = true;
        await user.save();

        // send otp to the user
        await fast2sms({
            message: `OTP is ${otp}, requested by ${user.fullName}`,
            contactNumber: user.phone
        },
        next);

    }catch(err) {
        console.log(err);
        usersLogger.error(`${err}`);
        // exceptionsLogger.exceptions.handle();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR, message:httpStatus['500_NAME']})
    }
}

// ---------------------- login with email ------------------------

exports.loginWithEmail = async (req, res,next) => { 
    try {
        let {email} = req.body;
        let user = await User.findOne({email}).lean();
        if(_.isEmpty(user)) {
            usersLogger.error(`400 || ${res.statusMessage} : ${messages.PHONE_NOT_FOUND_ERR} : ${req.originalUrl} : ${req.method}`);

            return res.status(httpStatus.CONFLICT).send({status:httpStatus.CONFLICT, message:USER_NOT_FOUND_ERR});
        }
        let otp = await otpGenerator(process.env.OTP_LENGTH);
        let data = `<p>Welcome to Xapads, Please find your One Time Password(OTP) <strong>${otp}</strong> for login</p><div>Thanks & Regards,</div><div>@Xapads Media Pvt. Ltd.</div>`;
        const text = htmlToText(data, {
            wordwrap: 130
        });
        
        let payload = {
            otp:otp,
            email:email,
            subject:`Login OTP @Xapads`,
            data:text,
            attachements:[]
        }
        const isEmailSent = await  sendEmail(payload);
        if(isEmailSent){
            await User.findOneAndUpdate({email},{$set:{phoneOtp:otp,isAccountVerified:true}})
            return res.status(httpStatus.OK).send({status:httpStatus.OK, message:"Email is sent successfully !"})
        }else{
            usersLogger.error(`409 || ${res.statusMessage} : ${messages.PHONE_NOT_FOUND_ERR} : ${req.originalUrl} : ${req.method}`);
            return res.status(httpStatus.CONFLICT).send({status:httpStatus.CONFLICT, message:"Failed to send the email !"})

        }
       
        return;
    }catch(err) {
        console.log(err);
        usersLogger.error(`${err}`);
        // exceptionsLogger.exceptions.handle();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR, message:httpStatus['500_NAME']})
    }
}
// ---------------------- Verify Phone OTP ------------------------

exports.verifyPhoneOtp = async (req,res,next) => {
    try {
        let {otp, phone} = req.body;
        console.log(req.params);
        const user = await User.findOne({phone}).lean();

        if(_.isEmpty(user)) {
            usersLogger.error(`400 || ${res.statusMessage} : ${messages.USER_NOT_FOUND_ERR} : ${req.originalUrl} : ${req.method}`);
            return res.status(httpStatus.BAD_REQUEST).send({
                status:httpStatus.BAD_REQUEST,message:messages.USER_NOT_FOUND_ERR
            });
        }
        if(user.phoneOtp !== otp) {
            usersLogger.error(`400 || ${res.statusMessage} : ${messages.INCORRECT_OTP_ERR} : ${req.originalUrl} : ${req.method}`)
            return res.status(httpStatus.BAD_REQUEST).send({
                status:httpStatus.BAD_REQUEST,message:messages.INCORRECT_OTP_ERR
            });
        }
        const token = await createJwtToken({userId:user._id});

        //updating the phoneOtp of user to " "
        await User.findOneAndUpdate({phone},{$set:{phoneOtp:"",token:token}},{new:true})
        
        return res.status(httpStatus.OK).send({status:httpStatus.OK, message:'OTP verified successfully !',
        data:{
            userId:user._id,
            token
        }
    });
    }catch(err) {
        console.log(err);
        usersLogger.error(`${err}`);
        // exceptionsLogger.exceptions.handle();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME']})
    }
}

// --------------------- get user details -------------------------

exports.getUserDetails = async (req, res) => {
    try {
        const currentUser = res.locals.user;
        return res.status(httpStatus.OK).send({status:httpStatus.OK, message:"User fetched Successfully !",data:currentUser})


    }catch(err) {
        console.log(err);
        usersLogger.error(`${err}`);
        // exceptionsLogger.exceptions.handle();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME']})

    }
}

// ---------------------- logout user -------------------------------

exports.logout = async (req,res) => {
    try {
        let {phone} = req.body;
        let isUpdate = await User.findOneAndUpdate({phone},{$unset:{token:""}});

        return res.status(200).send({status:200,message:'User is successfully logged out !'});
    }catch(err) {
        console.log(err);
        usersLogger.error(`${err}`);
        // exceptionsLogger.exceptions.handle();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME']});
    }
}

// ---------------------- delete a user ------------------------------
exports.deleteByMobile = async (req,res) => {
    try {
        let userId  = req.params.userId;
        let isDeleted = await User.findByIdAndUpdate({isDeleted:false,_id:mongoose.Types.ObjectId(userId)},
            {$set:{isDeleted:true,status:false}},{new:true});
        if(!_.isEmpty(isDeleted)){
            return res.status(httpStatus.ACCEPTED).send({status:httpStatus.ACCEPTED,message:`User deleted successfully !`});
        }else {
            return res.status(httpStatus.CONFLICT).send({status:httpStatus.CONFLICT,message:`Failed to delete User`});
        }
    }catch(err) {
        console.log(err);
        usersLogger.error(`${err}`);
        // exceptionsLogger.exceptions.handle();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME']});
    }
}

// ---------------------------- get users list ----------------------

exports.usersList = async (req,res) => {
    try {
        let limit = !req.query.limit ? 10 : parseInt(req.query.limit);
        let page = !req.query.page ? 1 : parseInt(req.query.page),
        skip = (page - 1) * limit;
        let searchKey = req.query.searchKey || "";
        let projection = {
            isDeleted:false
        }

        if(searchKey !== undefined || searchKey !== ""){
            page = 0,
            skip=0,
            projection = {
                ...projection,
                $or:[{
                    fullName:{'$regex':searchKey,'$options':'is'}
                },
                {
                    phone:{'$regex':searchKey}
                }]
            }
        }   

        let totalUser = await User.countDocuments({...projection});
        let pageMeta = {
            total:totalUser,
            pageSize: limit,
            skipRec:skip
        }
        let usersList = await User.find({...projection},{
            __v:0,
            createdAt:0,
            updatedAt:0,
            phoneOtp:0,
            token:0
        }).skip(skip)
        .limit(limit)
        .lean();

        // check if usersList is not empty
        if(!_.isEmpty(usersList)) {
            return res.status(httpStatus.OK).send({status:httpStatus.OK, message:'Users list successfully !',usersList, pageMeta});
        }else {
            return res.status(httpStatus.OK).send({status:httpStatus.OK, message:'No User Found!',data:[]});
        }
    }catch(err) {
        usersLogger.error(`${err}`);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({status:httpStatus.INTERNAL_SERVER_ERROR,message:httpStatus['500_NAME']});
    }
}
