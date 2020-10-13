const express = require ("express");
const app = express.Router();
const connection = require("../database");

app.get("/produtos",(req,res) => {
    res.status(200);
    connection.query("select * from produtos;",
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

app.get("/produto/:id",(req,res) => {
    let idc = req.params.id;
    res.status(200);
    connection.query("select * from produtos where ID = " + idc + " ;",
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

app.put("/produto/:id",async (req,res) => {
    let idc = req.params.id;
    let qtd = req.body.quant;
    let valor = req.body.valor;
    let user = req.body.user;
    let escolha = req.body.escolha;
    let descri = req.body.descricao;
    let quantb = 1;
    let qtdf = 0 ;

    if(valor === '0' && escolha !== -1){
        res.status(403);
        res.json({});
    }

    try{
       qtdf =  await banco();
    }
    catch (error) {
        console.log(error);
    }

    function banco() {
        return new Promise((resolve,reject) => {
            connection.query("select * from produtos where ID = " + idc + " ;",
                function (error, data) {
                    quantb = data[0].quantidade;
                    qtdf = quantb - parseInt(qtd);
                    resolve(qtdf);
            })
        })
    }

    if(qtdf<0){
        console.log(qtdf);
        res.status(409);
        res.json({});
    }
    else if(escolha !== -1) {
        connection.query("insert into carrinho values(NULL," + idc + ", '" + descri + "' , " + valor +  ", " + qtd + ", '" + user +"' )",
            function (error,data){
                if(error){
                    res.status(500);
                    res.json({});
                }
                else{
                    res.status(200);
                    res.json({});
                }
            });
    }
    else{
        connection.query("update produtos set quantidade = " + qtdf + " where ID = " + idc + ";");
        res.status(201);
        res.json({});
    }
})

app.patch("/produto/:id", async (req,res) => {
    req.params
})

module.exports = app;
