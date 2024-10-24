const products = require('../Models/productsModel')
const Subcategory = require('../Models/subCategoryModel')
const Category = require('../Models/categoryModel')
const user = require('../Models/userModel')


module.exports = {
    getAdmin: (req, res) => {
        res.render('adminPanel/admin', { user: req.session.user })
    },
    getProfile: (req, res) => {
        res.render('adminPanel/profile', { user: req.session.user })
    },
    getDashboard: async (req, res) => {
        try {
            const totalProducts = await products.countDocuments()
            const totalUsers = await user.countDocuments();
            res.render('adminPanel/dashboard', { user: req.session.user, totalProducts, totalUsers })
        } catch (error) {
            res.status(500).json({ error: 'Server Error' })
        }
    },
    getProducts: async (req, res) => {

        const { search, sort, category } = req.query;

        let query = {};
        if (search) {
            query.name = new RegExp(search, 'i')
        }
        if (category) {
            query.category = category
        }

        let sortOption = {}
        if (sort) {
            if (sort === 'name') {
                sortOption.name = 1;
            } else if (sort === 'price') {
                sortOption.price = 1
            } else if (sort === 'date') {
                sortOption.date = -1
            }
        }
        try {
            const subcategories = await Subcategory.find()
            const categories = await Category.find();
            const viewProducts = await products.find(query).sort(sortOption)
                .populate('category')
                .populate('subcategory')

            res.render('adminPanel/products', {
                user: req.session.user,
                viewProducts,
                categories, subcategories, products
            })
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    addCategory: async (req, res) => {
        try {
            const { name } = req.body;
            console.log(req.body)

            if (!name) {
                return res.status(400).json({ error: 'Category name is required' });
            }


            const existCategory = await Category.findOne({ name });
            if (existCategory) {
                return res.send('Name is already used');
            }
            const newCategory = new Category({ name: name })
            await newCategory.save()
            res.redirect('/categories');
        } catch (error) {
            console.error('Error', error)
            if (error.name === 'ValidationError') {
                return res.status(400).send({ error: 'Validation Error', details: error.errors }); 0.

                .0
            }
            res.status(500).send({ error: 'Server error' })
        }

    },
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find()
            const subcategories = await Subcategory.find()
                .populate('categoryId')



            const categoriesWithSubcategoryCount = categories.map(category => {
                const subcategoryCount = subcategories.filter(subcategory => subcategory.categoryId._id.toString() === category._id.toString()).length;
                return {
                    ...category.toObject(),
                    subcategoryCount
                }
            })
                res.render('adminPanel/categories', { user: req.session.user, categories: categoriesWithSubcategoryCount, subcategories });
        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    getSubcategories: async (req, res) => {
        try {
            if (req.session.user && req.session.user.role === 'admin') {
                const subcategories = await Subcategory.find();
                res.render('adminPanel/subcategories', { subcategories: subcategories });
            } else {
                res.redirect('/login');
            }
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    },
    addSubcategory: async (req, res) => {
        try {
            const { name, categoryId } = req.body;
            const existingSubcategories = await Subcategory.findById(categoryId);
            if (existingSubcategories) {
                return res.status(404).send({ error: 'Subcategory name already exists' });
            }
            const newSubcategory = new Subcategory({ name, categoryId })
            await newSubcategory.save();
            res.redirect('/categories');
        } catch (error) {
            res.status(500).send({ error: 'Server error' });
        }
    },
    getUsers: async (req, res) => {
        try {
            if (req.session.user && req.session.user.role === 'admin') {
                const users = await user.find({ role: 'user' })
                res.render('adminPanel/users', { users, user: req.session.user });
            } else {
                res.redirect('/login')
            }

        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    },
    getOrders: (req, res) => {
        if (req.session.user && req.session.user.role === 'admin') {
            res.render('adminPanel/orders', { user: req.session.user })
        } else {
            res.redirect('/login')
        }
    },
    getAddProducts: async (req, res) => {
        try {
            const categories = await Category.find();
            const subcategories = await Subcategory.find();

                res.render('adminPanel/addProducts', { user: req.session.user, categories, subcategories })
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }

    },

    addProducts: async (req, res) => {
        try {
            const { name, description, category, subcategory, sizes, stock, price, date } = req.body;
            const imagePaths = req.files.map(file => file.path);

            console.log('Request Body:', req.body);
            console.log('Uploaded File:', req.file);

            const newProduct = new products({
                name: req.body.name,
                description,
                category: req.body.category,
                subcategory: req.body.subcategory,
                sizes: sizes.split(','),
                stock,
                price,
                image: imagePaths,
                date
            });

            // Save the product to the database
            const savedProduct = await newProduct.save();

            // Store the product ID in the session
            req.session.productId = savedProduct._id;

            res.status(202).redirect('/products');
        } catch (error) {
            console.error('Error while adding product:', error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    editProducts: async (req, res) => {
        const productId = req.params.id;
        console.log(productId)

        const { newName, newDescription, newCategory, newSubcategory, newSizes, newStock, newPrice } = req.body
        const newImage = req.file ? req.file.path : null;
        console.log(req.body)
        try {
            const updatedProducts = await products.updateMany(
                { _id: productId }, {
                $set: {
                    name: newName,
                    description: newDescription,
                    category: newCategory,
                    subcategory: newSubcategory,
                    sizes: newSizes,
                    stock: newStock,
                    price: newPrice,


                }
            })
            if (newImage) {
                updatedProducts.image = newImage;
            }

            if (!updatedProducts) {
                res.status(404).send({ error: 'Product not found' })
            }

            console.log(updatedProducts)
            res.redirect('/products')
        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },

    deleteProducts: async (req, res) => {
        const productId = req.params.id;
        try {
            await products.deleteOne({ _id: productId });
            res.redirect('/products')

        } catch (error) {
            res.status(500).json({ error: 'Server error' })
        }
    },
    postBlockedUser: async (req, res) => {

        const userId = req.params.id;
        console.log(userId)
        try {
            const users = await user.findById(userId)

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            users.isBlocked = true;
            await users.save();
            res.redirect('/users')

        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    postUnBlockedUser: async (req, res) => {

        const userId = req.params.id;
        console.log(userId)
        try {
            const users = await user.findById(userId)

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            users.isBlocked = false;
            await users.save();
            res.redirect('/users')

        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    deleteCategories: async (req, res) => {
        const categoryId = req.params.id;
        console.log(categoryId)

        try {
            await Category.findByIdAndDelete(categoryId)
            res.redirect('/categories')
        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    deleteSubcategories: async (req, res) => {

        try {
            const { subcategoryId } = req.params;
            await Subcategory.findByIdAndDelete(subcategoryId);
            res.redirect('/categories')

        } catch (error) {
            res.status(500).json({ error: 'Server error' })
        }
    },

    editCategory: async (req, res) => {
        const categoryId = req.params.id;

        const { newCategoryName } = req.body;

        console.log(categoryId)
        console.log('New name:', newCategoryName)
        try {
            const updatedCategory = await Category.updateOne({ _id: categoryId }, { $set: { name: newCategoryName } })

            if (!updatedCategory) {
                return res.status(404).send({ error: 'Category is not found' })
            }
            console.log(updatedCategory)
            res.redirect('/categories')
        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    editSubcategory: async (req, res) => {

        try {
            const { subcategoryId, newSubcategoryName } = req.body;

            await Subcategory.findByIdAndUpdate(subcategoryId, { name: newSubcategoryName })

            res.redirect('/categories');
        } catch (error) {
            res.status(500).send({ error: 'Server error' });
        }
    },
    fetchSubcategory: async (req, res) => {
        try {
            const subcategories = await Subcategory.find({ categoryId: req.params.categoryId })
            res.json(subcategories)
        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    }

}