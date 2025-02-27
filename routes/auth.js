var router = require('express').Router();

const { MongoClient, ObjectId } = require('mongodb');
const { route } = require('./post');
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

const sha = require('sha256');
const session = require("express-session");
//세션 이용
router.use(session({
    secret : 'dkufe8938493j4e08349u',
    resave : false,
    saveUninitialized : true,
    cookie : {secure: false}
 }));

//get login
router.get("/login", function (req, res){
    console.log("req.session");
    if(req.session.user){
      console.log('세션 유지');
      res.send('index.ejs', { user : req.session.user});
    }else{
      res.render("login.ejs");
    }
});

//post login
router.post("/login", function(req, res) {
    console.log("아이디 : " + req.body.userid);
    console.log("비밀번호 : " + req.body.userpw);
    
    mydb.collection("account").findOne({ userid: req.body.userid })
    .then(result => {
      if (result.userpw == sha(req.body.userpw)) {
        req.session.user = req.body;  // 세션을 설정할 때는 req.session을 사용해야 합니다.
        console.log('새로운 로그인');
        res.render('index.ejs', { user : req.session.user});
        } else {
          res.send('login.ejs');
        }
        })
        .catch(err => {
        console.log(err);
        res.status(500).send('서버 오류');
        });
 });

//logout
router.get("/logout", function(req, res){
    console.log("로그아웃");
    req.session.destroy();
    res.render('index.ejs', {user : null});
});

//signup
router.get("/signup",function(req,res){
    res.render("signup.ejs");
});
router.post("/signup",function(req,res){
    console.log(req.body.userid);
    console.log(req.body.userpw);
    console.log(req.body.usergroup);
    console.log(req.body.useremail);
    mydb
    .collection("account")
    .insertOne({
      userid : req.body.userid,
      userpw: sha(req.body.userpw),
      usergroup: req.body.usergroup,
      useremail: req.body.useremail,
      })
    .then(result=>{
      console.log('회원가입 성공');
      });
    res.redirect("/");
});

module.exports = router;