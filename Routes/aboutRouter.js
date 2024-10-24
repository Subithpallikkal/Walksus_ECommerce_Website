const express =require('express');
const aboutRouter = express.Router();
const aboutController = require('../Controllers/aboutController');
const user = require('../Models/userModel');
const {isUser} = require('../middleware/Auth')

aboutRouter.get('/about',isUser,aboutController.getAbout);

module.exports = aboutRouter;

