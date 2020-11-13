function logadaum(req,res,next){
    if(req.session.user !== undefined){
        next();
    }
    else{
        console.log(req.session);
    }
}

module.exports = logadaum;