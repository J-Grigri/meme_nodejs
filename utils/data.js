const fs = require("fs");
const path = require('path')

const pathToData = path.join(__dirname, "../images.json")
const pathToMemes = path.join(__dirname, "../memes.json")

function loadData(){
    const buffer = fs.readFileSync(pathToData)
    const data = buffer.toString();
    return JSON.parse(data)
}

function saveData(data){
    fs.writeFileSync(pathToData, JSON.stringify(data))
}

function loadMemes() {
    const buffer = fs.readFileSync(pathToMemes)
    const data = buffer.toString();
    // console.log(data)
    return JSON.parse(data)
}
function saveMemes(data) {
    fs.writeFileSync(pathToMemes, JSON.stringify(data))
}

module.exports = {loadData, saveData, saveMemes, loadMemes}