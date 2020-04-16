var express = require('express');
var router = express.Router();
const upload = require('../utils/upload')
const { loadData, saveData } = require("../utils/data")
const fs = require("fs");
const jimp = require('jimp')

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Memezar!' });
});

router.get("/browse", (req, res) => {
  const data = loadData()
  res.render("allImages", { images: data })
})
router.put("/memes", (req, res) => {
  const data = loadData()
  res.render("allImages", { images: data })
})


function checkDub(req,res,next){
  const { file } = req//same as req.file, shorter syntax
  //file upload
  if (!file) {
    res.render("index", { error: "you need to upload a file" })
  }
  const data = loadData()
  
  //use findIndex to compare file names and sizes
  const found = data.findIndex(el => el.originalname === file.originalname && el.size === file.size) // expect to receive -1 or an index number if found
  //if there is no duplicate finIndex returns -1
  if (found !== -1) {
    //remove from json
    fs.unlinkSync(file.path) //
    return res.render("index", { error: "file duplicate error: this file is already uploaded" })
  }
  req.data = data
  next()
}



//endpoint for the upload form in index.hbs
router.post("/upload", upload, checkDub, async (req, res) => {
  const {file} = req;
  let data = req.data
  try {
  let image = await jimp.read(file.path)
  image.resize(jimp.AUTO, 250, jimp.RESIZE_NEAREST_NEIGHBOR);
  await image.writeAsync(file.path)//will return promise - wait until file ready
  //add an id to each item before it is pushed
  file.id = data.length === 0 ? 1 : data[data.length - 1].id + 1
  data.push(file)
  saveData(data)
  
// why is the color of bg.jpg different
  return res.render("allImages", { images: data })

  } catch (e) {
    fs.unlinkSync(file.path)//remove file
    //e is error object(built in)
    res.render("index", { error: e.message })
  }
  // req.duplicate = true  

})
module.exports = router;
