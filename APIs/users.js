const express = require ("express");
const app = express.Router();
const connection = require("../database");
const session = require("express-session");
const sha1 = require("js-sha1");

app.use(session({
    secret: "mond_land", cookie: { maxAge: 60*10000}
}));
function code(pass){
    sha1(pass);
    let hash = sha1.create();
    hash.update(pass);
    return hash.hex();
}

app.post("/users/login",(req, res) => {
    let user = req.body.user;
    let pass = req.body.pass;

    connection.query("select * from user where binary user = '" + user + "' ;",
        function (error,results) {
            if(results[0]!==undefined){
                let string = code(pass);
                if (results[0].password.localeCompare(string)===0){
                    req.session.user = {
                        username: user
                    }
                    res.status(200);
                    res.json({});
                }
                else {
                    res.status(401);
                    res.json({});
                }
            }
            else{
                res.status(404);
                res.json({});
            }
        }
    )
})
app.post("/users/new",async (req, res) => {
    let user = req.body.user;
    let pass = req.body.pass;
    let codigo = req.body.codigo;
    let existe = await verifica(user);

    if(codigo==="159375"){
        if(existe===1){
            connection.query("insert into user values('"+ user +"','"+ code(pass) +"');",function (error,data){
                if(error){
                    console.log(error);
                    res.status(500);
                    res.json({})
                }
                else{
                    res.status(200)
                    res.json({});
                }
            })
        }
        else if (existe===-1){
            res.status(401);
            res.json({});
        }
        else{
            res.status(500);
            res.json({});
        }
    }
    else{
        res.status(400);
        res.json({});
    }

})

function verifica(user){
    return new Promise((resolve, reject) => {
        connection.query("select * from user where binary user = '" + user + "' ;",
            function (error,data){
                if (data[0]!==undefined){
                    resolve(-1);
                }
                else{
                    resolve(1);
                }
                if(error){
                    reject(error);
                }
            }
    )
})
}
module.exports = app;