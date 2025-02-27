var router = require('express').Router();

const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.DB_URL;
const path = require('path');
const multer = require('multer');

const { route } = require('./post');

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

//list
router.get('/list', function(req, res) {
    mydb
    .collection('post')
    .find()
    .toArray()
    .then(result => {
      console.log(result);
      res.render('list.ejs', { data: result });
    });
});

//delete
router.post("/delete", function(req, res) {
    console.log('삭제 요청 받은 ID:', req.body._id);
    if (!ObjectId.isValid(req.body._id)) {
      return res.status(400).send("유효하지 않은 ID 형식입니다.");
      }
      req.body._id = new ObjectId(req.body._id);
      mydb.collection('post').deleteOne({ _id: req.body._id })
    .then(result => {
      console.log('삭제완료');
      res.status(200).send();
    })
    .catch(err => {
      console.log(err);
      res.status(500).send();
    });
});

//content
router.get('/content/:id', function(req, res) {
    console.log(req.params.id);
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send("유효하지 않은 ID 형식입니다.");
    }
    req.params.id = new ObjectId(req.params.id);
    mydb.collection("post").findOne({ _id: req.params.id })
    .then(result => {
      console.log(result);
      res.render("content.ejs", { data: result });
      })
      .catch(err => {
        console.log(err);
      res.status(500).send("데이터 조회에 실패했습니다.");
    });
});

//get edit
router.get('/edit/:id', function(req, res) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send("유효하지 않은 ID 형식입니다.");
      }
      req.params.id = new ObjectId(req.params.id);
    mydb.collection('post').findOne({ _id: req.params.id })
    .then(result => {
      console.log(result);
      if(result.path){
        result.path = result.path.replace(/\\public\\image\\/, "/image/");
        }
        res.render('edit.ejs', { data: result });
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("페이지 렌더링에 실패했습니다.");
        });
});

//post edit
router.post("/edit/:id", function(req, res) {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send("유효하지 않은 ID 형식입니다.");
    }
    const objectId = new ObjectId(req.params.id);
    const updatedData = {
        title: req.body.title,
        content: req.body.content,
        date: req.body.someDate
    };
    mydb.collection("post").updateOne({ _id: objectId }, { $set: updatedData })
    .then(result => {
        console.log("수정완료");
        res.redirect('/list');
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("데이터 수정에 실패했습니다.");
    });
});

//photo
let storage = multer.diskStorage({
    destination : function(req, file, done){
      done(null, './public/image')
    },
    filename : function(req, file, done){
      done(null, file.originalname)
    }
});
let upload = multer({storage : storage});
let imagepath = '';
  
router.post('/photo', upload.single('picture'),function(req, res){
  console.log("req.file.path");
  imagepath = '/public/image/' + req.file.originalname;
});

// search
router.get('/search', function (req, res) {
    console.log(req.query.value);
    mydb
      .collection("post")
      .find({ title: req.query.value }).toArray()
      .then(result => {
        console.log(result);
        result = result.map(post => {
          if (post.path) {
            post.path = post.path.replace(/\\public\\image\\/, "/image/");
          }
          return post;
        });
        res.render("sresult.ejs", { data: result, imagepath: imagepath });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("검색 중 오류가 발생했습니다.");
      });
  });
  
  module.exports = router;
  