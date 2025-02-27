var router = require('express').Router();
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

//enter
router.get('/enter', function(req, res) {
    res.render('enter.ejs');
});

//save
router.post('/save', function(req, res) {
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    mydb
    .collection('post')
    .insertOne({
        title: req.body.title,
        content: req.body.content,
        date: req.body.someDate,
        path: imagepath
    })
    .then(result => {
        console.log(result);
        console.log('데이터 추가 성공');
        res.redirect("/list");
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("데이터 추가에 실패했습니다.");
    });
});

module.exports = router;