module.exports = (req, res, next) => {
    
    if (!req.session.isLoggedIn) {
        return res.redirect('/influencer/accedi');
    } else {
        next();
    } 
    
}