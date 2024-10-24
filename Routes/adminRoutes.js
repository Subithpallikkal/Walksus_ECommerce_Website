const express = require('express');
const adRouter = express.Router();
const adminController = require('../Controllers/adminController')
const products = require('../Models/productsModel')
const {isAdmin} = require('../middleware/Auth')

const multer = require('multer');
const path = require('path');

// Set up multer for file uploads with disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage});



adRouter.get('/admin',isAdmin,adminController.getAdmin);
adRouter.get('/profile',isAdmin,adminController.getProfile)
adRouter.get('/dashboard',isAdmin,adminController.getDashboard)
adRouter.get('/products',isAdmin,upload.array('image',3),adminController.getProducts)
adRouter.get('/users',isAdmin,adminController.getUsers)
adRouter.get('/orders',isAdmin,adminController.getOrders)
adRouter.get('/addProducts',isAdmin,adminController.getAddProducts)
adRouter.get('/addProducts/:categoryId',isAdmin,adminController.fetchSubcategory)
adRouter.get('/categories',isAdmin, adminController.getCategories);

adRouter.post('/addProducts',upload.array('image',3),adminController.addProducts);
adRouter.post('/categories', adminController.addCategory);
adRouter.post('/subcategories', adminController.addSubcategory);

adRouter.put('/categories/:id', adminController.editCategory);
adRouter.put('/products/:id',upload.array('newImage',3),adminController.editProducts)
adRouter.put('/categories/:categoryId/subcategories/:subcategoryId', adminController.editSubcategory);

adRouter.delete('/products/:id',adminController.deleteProducts);
adRouter.delete('/categories/:id', adminController.deleteCategories);
adRouter.delete('/categories/:categoryId/subcategories/:subcategoryId', adminController.deleteSubcategories);



adRouter.get('/blockUser/:id',isAdmin,adminController.postBlockedUser)
adRouter.get('/unBlockUser/:id',isAdmin,adminController.postUnBlockedUser)



module.exports = adRouter;