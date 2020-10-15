const express = require ("express");
const app = express.Router();
const connection = require("../database");

app.get("/carrinho/:user",(req,res) => {
    let usuario = req.params.user;
    connection.query("select * from carrinho where usuario = '" + usuario + "' ;",
        function (err,data) {
            if(data !== undefined){
                res.status(200);
                res.json({produtos : data});
            }
            else{
                res.status(404);
                res.json({});
            }
        })
})

module.exports = app;
