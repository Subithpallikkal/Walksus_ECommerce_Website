const express =require('express');
const userRouter = express.Router();
const userController = require('../Controllers/userController');
const user = require('../Models/userModel');
const {isUser} = require('../middleware/Auth')
const {isAuthenticated} = require('../middleware/Auth')


userRouter.get('/home',isUser,userController.getHome)
userRouter.get('/signup',isUser,userController.getSignup)
userRouter.get('/login',isUser,userController.getLogin)
userRouter.get('/logout',isUser,userController.getLogout)
userRouter.get('/logout',isUser,userController.getLogout)
userRouter.get('/userProfile',isUser,userController.getProfile)
userRouter.get('/cart',isAuthenticated,userController.getCart)
userRouter.get('/address',isUser,userController.getAddresses)

userRouter.post('/addCart',isAuthenticated,userController.addItemToCart)
userRouter.post('/signup',userController.createSignup);
userRouter.post('/login',userController.createLogin);

userRouter.put('/cart',userController.updateCartItem)
userRouter.delete('/cart/:id',userController.deleteCart)

module.exports = userRouter;