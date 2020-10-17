const express = require ("express");
const app = express.Router();
const connection = require("../database");

app.get("/histovenda",(req, res) => {
    connection.query("select ID_venda,ID_produto,descricao_prod,qtd_vendido,valorvendido,user, \n" +
        "date_format(horavenda,'%d/%m/%Y %k:%i') as horavenda from vendas order by horavenda desc,ID_venda desc;",
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

module.exports = app;