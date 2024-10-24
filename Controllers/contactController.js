const User = require("../Models/userModel");

module.exports ={
    getContact:(req, res) => {
        res.render('userPanel/contact', {user:req.session.user });
}
}