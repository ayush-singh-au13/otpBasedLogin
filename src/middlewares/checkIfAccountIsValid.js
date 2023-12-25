const Account = require("./../models/account.model");
const httpStatus = require("http-status");
const _ = require("lodash");

module.exports = async (req, res, next) => {
  try {
    let accountNo = res.locals.user.accountNo;
    let currentAmount = await Account.findOne(
      { accountNo },
      { totalAmount: 1, _id: 0, amountCredited: 1 }
    ).lean();
    if (_.isEmpty(currentAmount)) {
      return res.send({
        status: httpStatus.NOT_FOUND,
        message: "No User is associated with this account !",
      });
    }
    req.body.data = {
      accountNo: accountNo,
      totalAmount: currentAmount.totalAmount,
      amountCreditedArray: currentAmount.amountCredited,
    };
    console.log(req.body.data);
    return next();
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: httpStatus["500_NAME"],
    });
  }
};
