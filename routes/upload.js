const fs = require('fs')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, Date.now() + '-' + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    cb (null, true)
  } else {
    cb (null, false)
  }
}
const upload = (req, res, next) => {
    console.log('fileController.upload: started', req.file)
    const file = req.file
    return res.status(200).json({
        status: "success",
        message: `File uploaded successfully: ${file.filename}`,
        filename: file.filename
    })
}

const download = (req, res, next) => {
    console.log('fileController.download: started')
    const path = req.body.path
    const file = fs.createReadStream(path)
    const filename = (new Date()).toISOString()
    res.setHeader('Content-Disposition', 'attachment: filename="' + filename + '"')
    file.pipe(res)
}


module.exports = (app) => {
  app.use(multer({storage, fileFilter}).single('file'))
  app.post('/upload', upload)
  app.post('/download', download)
}

