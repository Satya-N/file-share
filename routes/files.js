const router = require('express').Router();
const multer = require('multer')
const path = require('path')
const File = require('../models/File')
const { v4: uuid4 } = require('uuid')

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage,
    limit: { fileSize: 1000000 * 100 },
}).single('myfile')

router.post('/', (req,res) => {
    //store file
    upload(req, res,  async(err) => {
        //validate request
        if(!req.file) {
            return res.json({ error: 'All fields are required' })
        }
        if(err) {
            return res.status(500).send({ error: err.message })
        }
        //store file in db
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path.replace(/\\/g, "/"),
            size: req.file.size
        })
        const response = await file.save()
        return res.json({ file: `${process.env.APP_BASE_URI}/files/${response.uuid}` })
        // http://localhost:3000/files/236738ghjcb-dhjbcm22
    })
    
    //response -> link
})

router.post('/send', async(req,res) => {
    const { uuid, emailTo, emailFrom } = req.body;
    //Validate Request
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({
            error: 'All fields are required'
        })
    }
    //Get data From Database
    const file = await File.findOne({ uuid: uuid })
    if(file.sender) {
        return res.status(422).send({
            error: 'Email Already Sent'
        })
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    //Send Email
    const sendMail = require('../services/email');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'Sat File Sharing',
        text: `${emailFrom} Shared a File With You`,
        html: require('../services/emailtemplate')({
            emailFrom,
            downloadLink: `${process.env.APP_BASE_URI}/files/${file.uuid}`,
            size: parseInt(file.size/1000) + ' KB',
            expires: '24 hours'
        })
    });
    return res.send({success: true})
})


module.exports = router;