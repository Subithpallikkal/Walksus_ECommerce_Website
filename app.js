const express = require('express');
const port = 3008;
const ejs = require('ejs');
const mongoose = require('./DB/dataBase');
const session = require('express-session')
const {isAuthenticated} = require('./middleware/Auth')
const path = require('path')
const methodOverride = require('method-override')


//routes
const adRouter = require('./Routes/adminRoutes');
const userRouter = require('./Routes/userRouter');
// const prodRouter = require('./Routes/productsRouter');
const menRouter = require('./Routes/menRouter');
const womenRouter = require('./Routes/womenRouter');
const aboutRouter = require('./Routes/aboutRouter');
const contactController = require('./Controllers/contactController');
const contactRouter = require('./Routes/contactRouter');


const app = express();

app.use(express.static(path.join(__dirname, "public")))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');;
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));
app.use(methodOverride('_method'));

//to make user info available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});


//routes middleware
app.use('/', adRouter)
app.use('/', userRouter);
// app.use('/',prodRouter)
app.use('/', menRouter);
app.use('/', womenRouter);
app.use('/', aboutRouter);
app.use('/', contactRouter)


app.listen(port);