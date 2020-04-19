var express = require('express');
var router = express.Router();
const upload = require('../utils/upload')
const { loadData, saveData,loadMemes,saveMemes } = require("../utils/data")
const fs = require("fs");
const jimp = require('jimp')
const path = require('path')
const pathToMemes = path.join(__dirname,"../public/memes/")

// Each route can have one or more handler functions,
router.get('/', function (req, res) {
  res.render('index', { title: 'Memezar!' });
});
router.get("/original", (req, res) => {
  const data = loadData()
  res.render("allImages", { images: data })
})
router.get("/memes", (req, res) => {
  const data = loadMemes()
  res.render("memes", { images: data })
})

function checkDub(req,res,next){
  const { file } = req //same as req.file, shorter syntax
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
  data.unshift(file)
  saveData(data)
  
  return res.render("allImages", { images: data })

  } catch (e) {
    fs.unlinkSync(file.path)//remove file
    //e is error object(built in)
    res.render("index", { error: e.message })
  }
})

router.post("/create", async (req,res,next)=>{
  //read the 3 query. client can only send body using post/put/patch
  const {top,bot,id} = req.body
  // console.log("==================",top,bot,req)

  //guard against empty submission
  if(!id)
    return res.redirect( "/original")
  //guard against empty submission
  if(!top && !bot)
    return res.redirect( "/original")

  //////////////////////////////////////////////
  //use id to query original img
  const data = loadData();
  const selectedImageIndex = data.findIndex(image=>image.id*1 === id*1)// a string
  // if (selectedImageIndex === "-1"){
  //   return res.redirect("/original")
  // }

  const selectedImage = data[selectedImageIndex]
  let image = await jimp.read(selectedImage.path)
  const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE)

   image.print(
    font,
    50,
    0,
    {
      text: top,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_TOP
    },
    250,
    250
  );
  image.print(
    font,
    50,
    100,
    {
      text: bot,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
    },
    250,
    250
  );
  //create a new name for memes
  let newName = Date.now().toString() + selectedImage.filename
  //specify where to save memes
  console.log("=================================zZz",pathToMemes + newName) 
  await image.writeAsync(pathToMemes + newName)

  const memes = loadMemes()//array
  let newData = { 
    id: memes.length > 0 ? memes[memes.length-1].id+1 : 1,
    filename: newName
  }
  memes.push(newData)
  saveMemes(memes)

  res.render("memes", {images:memes})
})


module.exports = router;
