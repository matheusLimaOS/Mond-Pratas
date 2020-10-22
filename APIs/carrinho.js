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
app.delete("/carrinho/:user",(req, res) => {
    let user = req.params.user;

    connection.query("delete from carrinho where usuario = '" + user + "' ;",
        function (error,data){
            if(error){
                res.status(500);
                res.json({});
            }
            else{
                res.status(200);
                res.json({});
            }
        }
    )
})
app.delete("/carrinho/:user/:id",(req, res) => {
    let user = req.params.user;
    let idc = req.params.id;

    connection.query("delete from carrinho where usuario = '" + user + "' and id_produto = "+ idc +" ;",
        function (error,data){
            if(error){
                res.status(500);
                res.json({});
            }
            else{
                res.status(200);
                res.json({});
            }
        }
    )
})

module.exports = app;
