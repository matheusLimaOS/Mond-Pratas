const express = require ("express");
const app = express.Router();
const connection = require("../database");
const session = require("express-session");

app.use(session({
    secret: "mond_land", cookie: { maxAge: 60*10000}
}));

app.get("/users/login",(req, res) => {
    let user = req.body.user;
    let pass = req.body.pass;

    console.log(user + " " + pass);

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
                res.status(402);
                res.json({});
            }
        }
    )
})

module.exports = app;