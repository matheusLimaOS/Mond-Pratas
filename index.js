const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const sha1 = require("js-sha1");
const session = require("express-session");
const authMethod = require("./middlewares/authMethod");
const connection = require("./database");
const produto = require("./APIs/produto");
const carrinho = require("./APIs/carrinho");
const vendas = require("./APIs/histvenda");
let tam;

// Estou dizendo para o Express usar o EJS como View engine
app.set('view engine','ejs');
app.use(express.static('public'));

// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
function code(pass){
    sha1(pass);
    let hash = sha1.create();
    hash.update(pass);
    return hash.hex();
}

app.use('/',produto);
app.use('/',carrinho);
app.use('/',vendas);
//Sessões
app.use(session({
    secret: "mond_land", cookie: { maxAge: 60*10000}
}))

// GET
app.get("/",(req, res) => {
    entrou();
    res.render("login",{tex:"",styl:'margin: 0px 0px 0px 0px',role:'',aler:''});
});
app.get("/cadastrouser",(req, res) => {
    res.render("cadastro");
});
app.get("/logout",(req,res) =>{
    req.session.user = undefined;
    res.redirect("/");
});
app.get("/index",authMethod,(req, res) => {
    tam=0;
    res.render("index");
});
app.get("/venda",authMethod,(req, res) => {
    res.render('venda',{user : req.session.user.username});
});
app.get("/histvenda",authMethod,(req,res) => {
    let arr = new Array(100);

    connection.query("SET lc_time_names = 'pt_PT'");
    connection.query("select ID_venda,ID_produto,descricao_prod,qtd_vendido,valorvendido,user," +
        "date_format(horavenda,'%d/%m/%y %T') as horavenda from vendas order by horavenda desc,ID_venda desc;",
        function (error, results) {
        if(results===undefined)
            res.render('histvenda', {results: 0});
        else{
            res.render('histvenda', {results: results});
        }
    }
    )
});
app.get("/carrinho",authMethod,(req,res) => {
    res.render("carrinho", {user: req.session.user.username});
})
app.get("/inserir",authMethod,(req,res) => {
    connection.query("select * from produtos;",
        function (error, results) {
            if (results[0]===undefined){
                res.render('inserir', {results: 0});
            }
            else{
                res.render('inserir', {results: results});
            }
        });
})

// POST
app.post("/inserir",(req,res) => {
    let idc = req.body.idc;
    let desc = req.body.desc;
    let tam = req.body.tam;
    let val = req.body.val;
    let qtd = req.body.qtd;
    verif();

    function verif() {
        if (idc === '' || idc === undefined) {
            semid();
        } else {
            comid();
        }
    }

    function semid() {
        connection.query("insert into produtos values(NULL, '" + desc + "' ," + tam + "," + qtd + "," + val + " , DEFAULT);");
        res.redirect("/index");
    }

    function comid() {
        connection.query("update produtos set quantidade= " + qtd + " where ID= " + idc + ";");
        connection.query("update produtos set valor= " + val + " where ID = " + idc + ";");
        res.redirect("/index");
    }
})
app.post("/login", (req,res) => {
    user = req.body.user;
    let pass = req.body.password;

    connection.query("select * from user where binary user = '" + user + "' ;",
        function (error,results) {
            if(results[0]!==undefined){
                let string = code(pass);
                if (results[0].password.localeCompare(string)===0){
                    req.session.user = {
                        username: user
                    }
                    res.redirect("/index");

                }
                else[
                    res.render("login",{tex:"Senha incorreta",styl:'margin: 15px 0px 0px 0px',role:'alert',aler:'alert alert-danger'})
                ]
            }
            else{
                res.render("login",{tex:"Usuario não encontrado",styl:'margin: 15px 0px 0px 0px',role:'alert',aler:'alert alert-danger'});
            }
        }
    )



})
app.post("/cadastrouser",(req, res) => {
    let user = req.body.user;
    let pass = req.body.password;
    let seg = req.body.seg;

    if(seg.localeCompare("159375")===0){
        connection.query("select * from user where user = '" + user + "' ;",
            function (error,results) {
                if (results[0] === undefined) {
                    let string = code(pass);
                    connection.query("insert into user values( '" + user + "' , '" + string + "' )");
                    res.render("login",{tex:"Usuario cadastrado",styl:'margin: 15px 0px 0px 0px',role:'alert',aler:'alert alert-success'});
                }
                else{
                    res.render("login",{tex:"Usuario já cadastrado",styl:'margin: 15px 0px 0px 0px',role:'alert',aler:'alert alert-danger'});
                }
            }
        )
    }
    else{
        res.render("login",{tex:"Código de segurança incorreto",styl:'margin: 15px 0px 0px 0px',role:'alert',aler:'alert alert-danger'});
    }

});

function entrou(){
    connection.query("create database IF NOT EXISTS mondpratas");
    connection.query("CREATE TABLE IF NOT EXISTS `mondpratas`.`produtos` (\n" +
        "  `ID` INT NOT NULL AUTO_INCREMENT,\n" +
        "  `descricao` VARCHAR(45) NOT NULL,\n" +
        "  `tamanho` DOUBLE NOT NULL,\n" +
        "  `quantidade` INT NOT NULL,\n" +
        "  `valor` DOUBLE NOT NULL,\n" +
        "  `horario` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,\n" +
        "  PRIMARY KEY (`ID`));\n"
    );
    connection.query("CREATE TABLE IF NOT EXISTS `mondpratas`.`vendas` (\n" +
        "  `ID_venda` INT NOT NULL AUTO_INCREMENT,\n" +
        "  `ID_produto` INT NOT NULL,\n" +
        "  `descricao_prod` VARCHAR(45) NOT NULL,\n" +
        "  `qtd_vendido` INT NOT NULL,\n" +
        "  `valorvendido` DOUBLE NOT NULL,\n" +
        "  `user` varchar(45) NOT NULL,\n" +
        "  `horavenda` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,\n" +
        "  PRIMARY KEY (`ID_venda`));\n"
    );
    connection.query("CREATE TABLE IF NOT EXISTS `mondpratas`.`user` (\n" +
        "  `user` VARCHAR(45) NOT NULL,\n" +
        "  `password` VARCHAR(45) NOT NULL);\n"
    )
    connection.query("CREATE TABLE IF NOT EXISTS `mondpratas`.`carrinho` (\n" +
        "`id_carrinho` INT NOT NULL AUTO_INCREMENT,\n" +
        "`id_produto` INT NOT NULL,\n" +
        "`prod_descri` VARCHAR(45) NOT NULL,\n" +
        "`prod_valor` DOUBLE NOT NULL,\n" +
        "`prod_quant` INT NOT NULL,\n" +
        "`usuario` VARCHAR(45) NOT NULL,\n" +
        "PRIMARY KEY (`id_carrinho`));\n"
    )
}

//Colocando no ar
app.listen(8080,()=>{console.log("App rodando!");})