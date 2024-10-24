const express =require('express');
const contactRouter = express.Router();
const contactController = require('../Controllers/contactController');
const user = require('../Models/userModel');
const {isUser} = require('../middleware/Auth')

contactRouter.get('/contact',isUser,contactController.getContact);

module.exports = contactRouter;

