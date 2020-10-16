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
    let flag = 0 ;
    let flag2 = 0;
    let data = new Date();

   if(valor === '0' && escolha !== -1){
        res.status(403);
        res.json({});
        flag = 1;
    }

    if(flag!==1) {

        if (qtd < 0) {
            res.status(405);
            res.json({});
        }

        try {
            qtdf = await banco();
        } catch (error) {
            console.log("TESTE" + error);
        }

        function banco() {
            return new Promise((resolve, reject) => {
                connection.query("select * from produtos where ID = " + idc + " ;",
                    function (error, data) {
                        quantb = data[0].quantidade;
                        qtdf = quantb - parseInt(qtd);
                        resolve(qtdf);
                        reject(error);
                    })
            })
        }

        function igual() {
            return new Promise((resolve, reject) => {
                connection.query("select * from carrinho where id_produto= " + idc + " and usuario = '"+ user +"';",
                function (error,data){
                    if(data[0]!==undefined){
                        resolve(data);
                    }
                    else{
                        resolve(-1);
                    }
                })
            })
        }

        if (qtdf < 0) {
            res.status(409);
            res.json({});
        } else if (escolha !== -1) {
            flag2 = await igual();
            if(flag2 === -1) {
                connection.query("insert into carrinho values(NULL," + idc + ", '" + descri + "' , " + valor + ", " + qtd + ", '" + user + "' )",
                    function (error, data) {
                        if (error) {
                            res.status(500);
                            res.json({});
                        } else {
                            res.status(200);
                            res.json({});
                        }
                    });
            }
            else{
                let qtd2 = parseInt(flag2[0].prod_quant) + parseInt(qtd);
                connection.query("update carrinho set prod_quant = " + qtd2 + " where id_carrinho = " + flag2[0].id_carrinho);
                res.status(200);
                res.json({});
            }
        } else {
            connection.query("update produtos set quantidade = " + qtdf + " where ID = " + idc + ";");
            res.status(201);
            res.json({});
        }
    }
})

app.put("/produto/carrinho/:id",async (req,res) => {
    let idc = req.params.id;
    let qtd = req.body.quant;
    let valor = req.body.valor;
    let user = req.body.user;
    let descri = req.body.descricao;
    let quantb = 1;
    let qtdf = 0 ;


    if (qtd < 0) {
        res.status(405);
        res.json({});
    }

    try {
        qtdf = await banco();
    } catch (error) {
        console.log("TESTE" + error);
    }

    function banco() {
        return new Promise((resolve, reject) => {
            connection.query("select * from produtos where ID = " + idc + " ;",
                function (error, data) {
                    quantb = data[0].quantidade;
                    qtdf = quantb - parseInt(qtd);
                    resolve(qtdf);
                    reject(error);
                })
        })
    }

    if (qtdf < 0) {
        res.status(409);
        res.json({});
    }
    else {
        try {
            await update(qtdf,idc);
            await histvenda(idc,descri,qtd,valor*qtd,user);
            res.status(200);
            res.json({});
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({});
        }
    }
})

function update(qtdf,idprod){
    return new Promise((resolve, reject) => {
        connection.query("update produtos set quantidade = "+ qtdf +" where ID = "+ idprod +" ;",
            function (error, data) {
                if (error) {
                    reject(error);
                }
                else{
                    resolve(1);
                }
            });
    })
}

function histvenda(idprod,descriprod,qtdvend,valven,user){
    return new Promise((resolve, reject) => {
        connection.query("insert into vendas values(NULL,"+ idprod +", '"+ descriprod +"' , "+ qtdvend +" , "+  valven +", '"+ user +"',DEFAULT);",
            function (error){
                if(error){
                    reject(error);
                }
                else{
                    resolve(1);
                }
            })
    })
}

module.exports = app;
