const User = require("./../models/user.model");
const httpStatus = require("http-status");
const messages = require("./../error");
const _ = require("lodash");
// const mongoose = require("mongoose");
const Account = require("../models/account.model");
const moment = require("moment");


exports.listUserAccountDetail = async (req, res) => {
  try {
    let result = [];
    const accountDetail = await Account.findOne({
      accountNo: res.locals.user.accountNo,
    }).lean();
    result.push({
      _id: accountDetail._id,
      fullName: accountDetail.fullName,
      accountNo: accountDetail.accountNo,
      totalAmount: accountDetail.totalAmount,
      isDeleted: accountDetail.isDeleted,
      lastUpdated: moment(accountDetail.updatedAt).format("DD-MM-YYYY hh:mm"),
    });
    if (!_.isEmpty(accountDetail)) {
      return res
        .status(httpStatus.OK)
        .send({ status: httpStatus.OK, data: result[0] });
    }
  } catch (err) {
    return res
      .status(httpStatus.InternalServerError)
      .send({ status: httpStatus.InternalServer, messages: err.message });
  }
};

exports.addAmount = async (req, res) => {
  try {
    console.log("======>");
    let amount = req.body.amountCredited;
    let accountNo = req.body.data.accountNo;
    let isUpdated;
    
    let serialNo =  req.body.data.amountCreditedArray.length > 0 ?
    req.body.data.amountCreditedArray[req.body.data.amountCreditedArray.length - 1]
        .serialNo : 0;

    let newAmount = Number(amount) + Number(req.body.data.totalAmount);
  
    if (newAmount > Number(req.body.data.totalAmount)) {
      ++serialNo;
      await Account.updateOne(
        { accountNo: accountNo },
        {
          $push: {
            amountCredited: {
              amount: amount,
              serialNo: serialNo,
              creditedAt: moment(new Date(Date.now())).format('DD-MM-YYYY HH:mm:ss')
            },
          },
        }
      );
      isUpdated = await Account.findOneAndUpdate(
        { accountNo },
        { $set: { totalAmount: newAmount } },
        //     // {$push:{amountCredited:{...dataToPush}}},
        { new: true }
      );
    } else {
      return res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        message: "Need not to update the amount as there is no new credit",
      });
    }
    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "Amount updated successfully",
      data: isUpdated,
    });
  } catch (e) {
    return res
      .status(httpStatus.InternalServerError)
      .send({ status: httpStatus.InternalServer, messages: err.message });
  }
};
