const User = require("../Models/userModel");

module.exports ={
    getAbout:(req, res) => {
        res.render('userPanel/about', {user:req.session.user });
}
}