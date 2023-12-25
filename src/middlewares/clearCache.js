// const apicache = require('apicache');


// module.exports = (req,res,next) => {
//     let cache = apicache.options({
//         headers: {
//           'cache-control': 'no-cache',
//         },
//       }).middleware
    
//       let _cache = new cache();
//     console.log(_cache.options());
//     apicache.clear(req.body.phone);
//     next();
// }