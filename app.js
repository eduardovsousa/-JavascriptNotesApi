var express = require('express');
var path = require('path');
var logger = require('morgan');
//Importando o mongoose
require('./config/database')
//importanto o CORS
var cors = require('cors')

var usersRouter = require('./app/routes/users');
var notesRouter = require('./app/routes/notes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
//Habilitando o CORS
app.use(cors())

//Chamando a rota do user
app.use('/users', usersRouter);
app.use('/notes', notesRouter);

module.exports = app;
