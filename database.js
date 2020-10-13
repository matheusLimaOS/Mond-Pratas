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
});

module.exports = connection;