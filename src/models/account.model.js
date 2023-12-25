const { model, Schema } = require("mongoose");

const accountSchema = new Schema(
  {
    fullName: {
      type: String,
    },
    accountNo: {
      type: String,
      required: true,
    },
    amountCredited: {
      type:Array,
      default:[]
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = model("Account", accountSchema);
