const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    fullName:{
      type:String
    },
    isAccountVerified:{
      type:Boolean
    },
    accountNo:{
      type:String,
      required:true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email:{
      type:String,
      required:true,
      unique:true
    },
    role :{
     type : String,
     enum:["ADMIN","USER"],
     default:"USER",
    },
   phoneOtp:String,
   isDeleted:{
    type:Boolean,
    default:0
   },
   status:{
    type: Boolean,
    default:1
   },
   token:{
    type:String
   }
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
