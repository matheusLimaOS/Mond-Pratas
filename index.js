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
const users = require("./APIs/users");
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
app.use('/',users);
//Sessões
app.use(session({
    secret: "mond_land", cookie: { maxAge: 60*10000}
}))

// GET
app.get("/",(req, res) => {
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
    res.render('histvenda', {results: 0});
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

//Colocando no ar
app.listen(8080,()=>{console.log("App rodando!");})