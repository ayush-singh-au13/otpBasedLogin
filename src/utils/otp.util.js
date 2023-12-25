const fast2sms = require('fast-two-sms');
const FAST2SMS = process.env.FAST2SMS;
const otpGenerator = require('otp-generator');

// generating OTP
exports.generateOTP = async (otp_length) => {
    let digits = "0123456789",
    otp="";
    for(let i=0;i<otp_length;i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

// fast2sms

exports.fast2sms = async ({message, contactNumber},next) => {
    try{
        let number = Number(contactNumber)
        var options = {
            authorization : FAST2SMS,
            message: message,  
            numbers : [contactNumber]} 
        console.log("options",contactNumber,message)
        const response = await fast2sms.sendMessage(options);
        console.log("====>",response);

    }catch(err) {
        throw new Error(err)
    }
}

// generate otp using package
exports.otpGenerator =async (otp_length) => {
    const otp_config = {
        lowerCaseAlphabets : false,
        upperCaseAlphabets: false, 
        specialChars: false 
    }
    const otp = otpGenerator.generate(otp_length,otp_config);
    console.log("====>",otp);
    return otp;
}