const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'Category',
      required: true
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true
    },
    sizes: {
      type: [String],
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image:[ {
      type:String ,
      required: true
    }],
    date:{
      type:Date,
      default:Date.now
    }
  });
  
const products = mongoose.model('Products', ProductSchema);
module.exports = products
