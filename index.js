const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const authMethod = require("./middlewares/authMethod");
const connection = require("./database");
const produto = require("./APIs/produto");
const carrinho = require("./APIs/carrinho");
const vendas = require("./APIs/histvenda");
const users = require("./APIs/users");
const cors = require("cors");
let tam;

// Estou dizendo para o Express usar o EJS como View engine
app.set('view engine','ejs');
app.use(express.static('public'));
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE,OPTIONSr');
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    app.use(cors());
    next();
})


// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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

//Colocando no ar
app.listen(8080,()=>{console.log("App rodando!");})