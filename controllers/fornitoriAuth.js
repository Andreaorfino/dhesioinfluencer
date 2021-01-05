

exports.getRegistrazioneAziende = (req, res, next) => {
    res.render('fornitori/registrazione', {
        pageTitle: 'Registrazione',
        isAuthenticated: false
    });
}
/* 
exports.postRegistrazioneAziende = (req, res, next) => {

}

exports.getloginAziende = (req, res, next) => {

}

exports.postLoginAziende = (req, res, next) => {

} */