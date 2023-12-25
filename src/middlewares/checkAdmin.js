const { ACCESS_DENIED_ERR } = require('./../error');
const httpStatus = require('http-status');

module.exports = (req,res,next) => {
    try {
        const currentUser = res.locals.user;
        if(!currentUser) {
            return next({status: httpStatus.UNAUTHORIZED,message: ACCESS_DENIED_ERR});
        }
        if(currentUser.role === "ADMIN") {
            return next();
        }
        return res.status(httpStatus.UNAUTHORIZED).send({status:httpStatus.UNAUTHORIZED,message: ACCESS_DENIED_ERR});
    }catch(e) {
        next(e);
    }
}