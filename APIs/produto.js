const express = require ("express");
const app = express.Router();
const connection = require("../database");
const session = require("express-session");

app.use(session({
    secret: "mond_land", cookie: { maxAge: 60*10000}
}));

app.get("/produtos",(req,res) => {
    console.log(req.session.user);
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
    let qtdf = 0 ;


    if (qtd < 0) {
        res.status(405);
        res.json({});
    }

    try {
        qtdf = await banco(idc,qtd);
    } catch (error) {
        console.log("TESTE" + error);
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

app.put("/produto/editar/:id", async (req,res) => {
    let idc = req.params.id;
    let qtd = req.body.quant;
    let valor = req.body.valor;
    let tam = req.body.tamanho;
    let qtdf;


    try{
        qtdf = await banco2(idc);
    }
    catch (error){
        console.log(error);
    }

    if (qtd < qtdf) {
        res.status(409);
        res.json({});
    }
    else {
        try {
            await edit(qtd,idc,tam,valor);
            res.status(200);
            res.json({});
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({});
        }
    }
})

app.post("/produto/",async (req,res) => {
    let desc = req.body.desc;
    let tamanho = req.body.tamanho;
    let quantidade = req.body.quant;
    let valor = req.body.valor;

    if(desc === '' || tamanho < 0 || quantidade < 0 || valor <= 0 ){
        res.status("405");
        res.json({});
    }
    else if(await verifica(desc,tamanho) !== -1){
        res.status("409");
        res.json({
            idprods: await verifica(desc,tamanho)
        });
    }
    else{
        connection.query("insert into produtos values(NULL, '"+ desc +"' , "+ tamanho +", "+ quantidade +", "+ valor +", DEFAULT)",
            function (error,data){
                if(error){
                    console.log(error);
                    res.status(500);
                    res.json({});
                }
                res.status(200);
                res.json({});
            }
        )
    }
})

function verifica(desc,tamanho){
    return new Promise((resolve, reject) => {
        connection.query("select * from produtos where descricao like '%" + desc + "%' and tamanho = " + tamanho + " ;",
            function (error, data) {
                if (error) {
                    reject(error);
                }
                if(data[0]!== undefined){
                    resolve(data.ID);
                }
                else{
                    resolve(-1);
                }
            }
        )
    })
}

function edit(qtd,idprod,tam,valor){
    return new Promise((resolve, reject) => {
        connection.query("update produtos set tamanho = "+ tam + ", quantidade = " + qtd + ", valor = " + valor + " where ID = "+ idprod +" ;",
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

function banco(idc,qtd) {
    return new Promise((resolve, reject) => {
        connection.query("select * from produtos where ID = " + idc + " ;",
            function (error, data) {
                let quantb = data[0].quantidade;
                let qtdf = quantb - parseInt(qtd);
                resolve(qtdf);
                reject(error);
            })
    })
}

function banco2(idc) {
    return new Promise((resolve, reject) => {
        connection.query("select * from produtos where ID = " + idc + " ;",
            function (error, data) {
                quantb = data[0].quantidade;
                resolve(quantb);
                reject(error);
            })
    })
}

module.exports = app;
