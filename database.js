const mysql = require("mysql");

//criando config. da conexão com o banco de dados
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "159375",
    database: "mondpratas"
});

// conectando com o banco de dados
connection.connect(function (err) {
    if(err) console.error('Erro ao realizar conexão com o BD!' +
        err.stack);
    else{
        entrar();
    }
});
function entrar(){
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


module.exports = connection;