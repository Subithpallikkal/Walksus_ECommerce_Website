const mongoose = require('mongoose')
const User = require("../Models/userModel");
const Products = require("../Models/productsModel");
const Category = require("../Models/categoryModel");
const { getProducts } = require('./adminController');
const { getProductsDetails } = require('./menController');

module.exports = {
    getWomen: async (req, res) => {
        try {
            const womenCategory = await Category.findOne({ name: 'Women' })
            const womenProducts = await Products.find({ category: womenCategory._id }).populate('category').populate('subcategory')
            res.render('userPanel/women', { user:req.session.user, products: womenProducts });
        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    getProductsDetails:async (req,res) =>{
        try{
            const productId = await req.params.id
            console.log(productId)
            const product = await Products.findById({_id:productId})
            res.render('userPanel/product-detail',{product,user:req.session.user})
        }catch(error){
            res.status(500).send({error:'Server error'})
        }
    }
}