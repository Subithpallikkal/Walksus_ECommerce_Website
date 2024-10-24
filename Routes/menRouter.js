const express =require('express');
const menRouter = express.Router();
const menController = require('../Controllers/menController');
const user = require('../Models/userModel');
const {isUser} = require('../middleware/Auth')

menRouter.get('/men',isUser,menController.getMen);
menRouter.get('/product-detail/:id',isUser,menController.getProductsDetails);

module.exports = menRouter;

