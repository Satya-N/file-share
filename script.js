const File = require('./models/File')
const fs = require('fs')
const db = require('./config/db');
const connectDB = require('./config/db');


connectDB();
async function fetchData() {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const files = await File.find({ createdAt: { $lt: pastDate } })
    if(files.length) {
        for(let file of files) {
            try{
                fs.unlinkSync(file.path.replace(/\\/g, "/"));
                await file.remove();
                console.log(`Successfully Removed ${file.filename}`)
            }catch(e) {
                console.log(`Error While Deleting File ${e}`)
            }
        }
        console.log('Job Done')
    }
}

fetchData().then(process.exit);