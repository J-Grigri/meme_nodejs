var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//endpoint for the upload form in index.hbs
router.post("/upload", (req, res, next)=>{
  res.render("allImages")
})
module.exports = router;
