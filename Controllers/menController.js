const mongoose = require('mongoose')
const User = require("../Models/userModel");
const products = require("../Models/productsModel")
const category = require('../Models/categoryModel')

module.exports = {
    getMen: async (req, res) => {
        try {
            const menCategory = await category.findOne({name:'Men'})
            console.log(menCategory)
            const menProducts = await products.find({ category: menCategory._id }).populate('category').populate('subcategory')
            res.render('userPanel/men', { user:req.session.user, products: menProducts });
        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    getProductsDetails: async(req, res) => {
        try{
            const productId =await req.params.id
            console.log(productId)
            const product = await products.findById({_id:productId})
            res.render('userPanel/product-detail', {product,user : req.session.user});
        }catch(error){
            console.error('Error fetching product details:', error);
            res.status(500).send('Server Error');
        }

        }

}