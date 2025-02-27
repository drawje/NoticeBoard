const express = require('express');
const app = express();
const sha = require('sha256');
const path = require('path');
const session = require("express-session");
const multer = require('multer');
const dotenv = require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.DB_URL;

let mydb;

MongoClient.connect(url)
  .then((client) => {
    mydb = client.db('myboard');
    mydb.collection('post').find().toArray().then(result=>{
      console.log(result);
    });

    app.listen(process.env.PORT , function () {
      console.log("포트 8080으로 서버 대기중 ... ");
    });
  })
  .catch((err)=>{
    console.log(err);
});

var mysql = require("mysql");
var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "011825809196wj!",
  database: "myboard",
});

conn.connect();

//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

// 정적 파일 서빙 경로 설정
app.use('/public', express.static('public'));
app.use('/', require('./routes/post.js'));
app.use('/', require('./routes/add.js'));
app.use('/', require('./routes/auth.js'));

const db = require('node-mysql/lib/db');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/book", function (req, res) {
  res.send("도서 목록 관련 페이지입니다.");
});

app.get(`/`, function (req, res) {
  if(req.session.user){
    console.log("세션 유지");
    res.render("index.ejs", { user : req.session.user});
  }else{
    console.log("user : null");
    res.render("index.ejs",{user : null});
  }
});

