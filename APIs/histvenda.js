const express = require ("express");
const app = express.Router();
const connection = require("../database");

app.get("/histovenda",(req, res) => {
    connection.query("select ID_venda,qtd_vendido,val_vendido,user, \n" +
        "date_format(hora_venda,'%d/%m/%Y %k:%i') as horavenda from vendas order by horavenda desc,ID_venda desc;",
        function (error,data){
            if(error){
                console.log(error);
                res.status(500);
                res.json({});
            }
            else if (data[0]===undefined){
                res.status(404)
                res.json({});
            }
            else{
                res.status(200);
                res.json({vendas : data});
            }
        })
})

app.post("/venda/:user",async (req, res) => {
    let user = req.params.user;
    let num=0;
    console.log("1");
    connection.query("select count(*) as conta from vendas_itens where id_venda=-1",
        await function (error,data){
            console.log("2");
            num=data[0].conta;
    })

    console.log("3");

    if(num!==0) {
        connection.query("insert into vendas values(NULL, -1 , -1, '" + user + "',DEFAULT);",
            function (error, data) {
                if (error) {
                    res.json({});
                    res.status(500)
                } else {
                    try {
                        connection.query("update vendas_itens set ID_venda = " + data.insertId + " where ID_venda = -1");
                        connection.query("update vendas set qtd_vendido = (select sum(qtd_vendido) from vendas_itens where ID_venda = " + data.insertId + ")," +
                            "val_vendido = (select sum(valor_vendido) from vendas_itens where ID_venda = " + data.insertId + ") " +
                            "where ID_venda = " + data.insertId);
                        res.status(200);
                        res.json({});
                    } catch (err) {
                        console.log(err);
                    }

                }
            }
        )
    }
})


module.exports = app;