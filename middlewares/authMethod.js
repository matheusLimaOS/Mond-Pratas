function logadaum(req,res,next){
    if(req.session.user !== undefined){
        next();
    }
    else{
        console.log(req.session);
        res.status(401);
        res.json({});
    }
}

module.exports = logadaum;