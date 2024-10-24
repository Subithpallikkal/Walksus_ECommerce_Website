const express =require('express');
const womenRouter = express.Router();
const womenController = require('../Controllers/womenController');
const user = require('../Models/userModel');
const {isUser} = require('../middleware/Auth')

womenRouter.get('/women',isUser,womenController.getWomen);
womenRouter.get('/product-detail/:id',isUser,womenController.getProductsDetails);

module.exports = womenRouter;

