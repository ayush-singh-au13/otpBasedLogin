const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let DB = process.env.DB
        const conn =  await mongoose.connect(DB, {useNewUrlParser:true, useUnifiedTopology:true});
        console.log(`MongoDb Connected: ${conn.connection.host}`)
        mongoose.set('debug',true);
    }catch(err) {
        console.log(err)
        process.exit(1);
    }
}

module.exports = connectDB;
