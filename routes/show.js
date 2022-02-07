const router = require('express').Router();
const File = require('../models/File')

router.get('/:uuid', async(req,res) => {
    try {
        //Fetching file from DB
        const file = await File.findOne({ uuid: req.params.uuid });
        if(!file) {
            return res.render('download', { 
                error: 'Link has been Expired'
            })
        }
        return res.render('download', {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            download: `${process.env.APP_BASE_URI}/files/download/${file.uuid}`
            //http://localhost:3000/files/download/2536gufgjsgy36-qvhq36363b
        })
    }catch(e) {
        return res.render('download', { 
            error: 'Something went Wrong'
        })
    }
    
})


module.exports = router;