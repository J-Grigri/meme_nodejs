const multer = require('multer')
const path = require('path')//current full path
//specify where the files will be saved
const pathToUpload = path.join(__dirname, "../public/uploads")
//function structure comes from multer template
const storage = multer.diskStorage({
    //where to save the files
    destination: function (req, file, cb) {
        cb(null, pathToUpload) // if there is no 1st arg(error), multer will use 2nd as path to folder
    },
    
    //Change the file when it is uploaded
    filename: function (req, file, cb) {
        const allows = ["image/jpeg", "image/png", "image/jpg", "image/gif"]
        //check if the file type uploaded is in format specified above
        if (!allows.includes(file.mimetype)) {
            const error = new Error("Ooops. Filetype wrong")
            return cb (error, undefined)
        }
        cb(null, Date.now().toString() + file.originalname) // gotta use this
        // cb(null,file.originalname)  // or just simply this and remove the unlink :D. i
    }

})
//single specifies that only one file can be uploaded. Name must be the same with input field name
const upload = multer({ storage: storage }).single('fileUpload')

module.exports = upload