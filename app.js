var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expresslayouts = require('express-ejs-layouts')
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const session = require("express-session");
require('dotenv').config();

const db = require('./models/connection')
var app = express();

app.set('trust proxy',true)
app.use((req,res,next)=>{
  const privateIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  req.clientIP = privateIP;
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expresslayouts)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/')));
app.use(express.static(path.join(__dirname, 'public/adminAssets')));
app.use(
  session({
    secret: "key",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);
app.use('/', usersRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
