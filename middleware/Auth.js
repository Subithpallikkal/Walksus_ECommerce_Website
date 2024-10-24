function isAdmin(req, res, next) {
  if (req.session.user  && req.session.user.role === 'admin' ) {
    next();
  } else {
    res.redirect('/login')
  }
}

function isUser(req,res,next){
  const user = req.session.user
    next()
}

function isAuthenticated(req,res,next){
  if(req.session.user && req.session.userId){
    next()
  }else{
    res.redirect('/login')
  }
}
module.exports = {isAdmin,isUser,isAuthenticated};