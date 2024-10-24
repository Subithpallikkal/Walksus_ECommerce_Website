const User = require("../Models/userModel");
const Products = require('../Models/productsModel')
const Cart = require('../Models/cartModel')
const mongoose = require('mongoose');
const user = require("../Models/userModel");


module.exports = {
    getHome: async (req, res) => {
        try {
            const products = await Products.find()
            res.render('userPanel/home', { user: req.session.user, products });

        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    getSignup: (req, res) => {
        res.render('userPanel/signup', { error: req.session.error }); // Pass error to template
        req.session.error = {}; // Clear error after rendering
    },
    createSignup: async (req, res) => {
        try {
            const { username, email, password, cpassword } = req.body;
            console.log(req.body);

            req.session.error = {}; // Reset session errors

            // Regex patterns
            const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

            // Validation
            if (!usernameRegex.test(username)) {
                req.session.error.username = 'Username must be 3-15 characters long and can only contain letters, numbers, and underscores';
                return res.send('Username must be 3-15 characters long and can only contain letters, numbers, and underscores')
            }
            if (!emailRegex.test(email)) {
                req.session.error.email = 'Invalid Email format';
                res.send('Invalid Email format')
            }
            if (!passwordRegex.test(password)) {
                req.session.error.password = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number';
                return res.send('not valid ')
            }
            if (password !== cpassword) {
                req.session.error.cpassword = 'Passwords do not match';
                return res.send('Passwords do not match')
            }

            // Check if any validation errors
            if (Object.keys(req.session.error).length > 0) {
                return res.redirect('/signup');
            }

            // Check if user already exists
            const existUser = await User.findOne({ email });
            if (existUser) {
                req.session.error.email = 'Email is already in use';
                return res.redirect('/login');
            }

            // Create new user object
            const newUser = new User({ username, email, password, cpassword });

            // Save the user to the database
            await newUser.save();

            // Redirect to home page after successful signup
            res.redirect('/login');
        } catch (err) {
            console.error('Signup failed:', err);
            res.status(500).send('Server error');
        }
    },
    getLogin: (req, res) => {
        const alreadyLoggedIn = req.session.alreadyLoggedIn || false;
        req.session.alreadyLoggedIn = false
        res.render('userPanel/login', { alreadyLoggedIn });
    },
    createLogin: async (req, res) => {
        try {
            const { email, password } = req.body;

            req.session.error = {}; // Reset session errors

            const user = await User.findOne({ email });

            // Check if user exists
            if (!user) {
                req.session.error.email = 'User not found';
                // return res.redirect('/login');
                return res.send('User not found')
            }

            // Check password
            if (password !== user.password) {
                req.session.error.password = 'Incorrect password';
                // return res.redirect('/login');
                return res.send('password is incorrect')
            }

            if (req.session.user) {
                req.session.alreadyLoggedIn = true;
                return res.redirect('/login')
            }

            req.session.userId = user._id
            req.session.user = user;
            if (user.role === 'admin') {
                return res.redirect('/admin')
            } else if (user.isBlocked) {
                return res.send('Your account has been blocked. Please contact the amdministrator.')
            } else {
                return res.redirect('/home')
            }
        } catch (err) {
            console.error('Login failed:', err);
            res.status(500).send('Server error')
        }
    },
    getProfile:async(req,res)=>{
        try {
            res.render('userPanel/profile', { user: req.session.user });

        } catch (error) {
            res.status(500).send({ error: 'Server error' })
        }
    },
    getLogout: (req, res) => {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Failed to destroy session during logout:', err);
                    return res.status(500).send('Failed to logout')
                }
                res.redirect('/home')
            })
        } else {
            res.redirect('/login')
        }
    },
    getCart: async (req, res) => {
        try {
            const userId = req.session.userId
            const cart = await Cart.findOne({ userId }).populate('items.productId')
            console.log(JSON.stringify(cart, null, 2))
            // if(!cart){
            //     return res.status(404).json({message:'Cart not found'})
            // }

            const user = req.session.user;
            if (!user) {
                res.redirect('/login')
            } else {
                res.render('userPanel/cart', { user, cart });
            }

        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    addItemToCart: async (req, res) => {

        const userId = req.session.userId
        console.log(userId)
        if (!userId) {
            return res.redirect('/login')
        }
        const { productId, quantity } = req.body
        try {

            const product = await Products.findById(productId)
            if (!product) {
                return res.status(400).json({ message: 'Product not found' })
            }
            const price = product.price
            const totalPrice = price * quantity;

            let cart = await Cart.findOne({ userId })
            if (!cart) {
                cart = new Cart({ userId, items: [] })
            }

            cart.items.push({ productId, quantity, price, totalPrice })


            await cart.save()
            console.log(cart)
            res.redirect(`/product-detail/${productId}`)

        } catch (error) {
            res.status(500).send({ message: error })
        }
    },
    updateCartItem:async(req,res)=>{
        const {userId,productId,quantity} = req.body;

        try{
            const cart = await Cart.findOne({userId})

            if(cart){
                const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

                if(itemIndex > -1){
                    const item = cart.items[itemIndex]
                    item.quantity = quantity;
                    item.totalPrice = item.price * quantity;

                    if(item.quantity <= 0){
                        cart.items.splice(itemIndex,1)
                    }

                    cart.totalPrice = cart.items.reduce((acc,item) => acc + item.totalPrice,0);
                    await cart.save()
                    res.status(200).json({message:'Cart updated',cart})
                }else{
                    res.status(404).json({message:'Product not found in cart'})
                }
            }else{
                res.status(404).json({message:'Cart is not found'})
            }
            
        }catch(error){
            res.status(500).json({message:'Sever error',error})
        }
    },
    deleteCart:async(req,res)=>{
        const cartId = req.params.id
        console.log(cartId)

        try{
            await Cart.findByIdAndDelete(cartId)
            res.redirect('/cart')

        }catch(error){
            res.status(500).json({message:'Server error',error})
        }
    },
    getAddresses:async(req,res)=>{
            res.render('userPanel/address',{user:req.session.user})
    }
};

