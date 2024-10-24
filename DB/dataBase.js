const mongoose = require('mongoose');

module.exports = mongoose.connect('mongodb://localhost:27017/ecommerce')
.then(()=>{
    console.log('Mongodb is connected')
}).catch((err)=>{
    console.error('Connection is failed',err)
})
