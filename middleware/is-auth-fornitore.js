module.exports = (req, res, next) => {
        
    if (!req.session.isLoggedIn) {
        return res.redirect('/accedi');
    } else if(req.user.role == 'fornitore') {
        next();
    } else {
        return res.redirect('/aiuto');
    }
    
}