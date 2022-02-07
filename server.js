const express = require('express');
const connectDB = require('./config/db');
const fFiles = require('./routes/files');
const sFiles = require('./routes/show');
const dFiles = require('./routes/download')
const path = require('path')

const app = express();

connectDB();

app.use(express.static('public'))
app.use(express.json());

//Template engine

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

//Routes
app.use('/api/files', fFiles)
app.use('/files', sFiles)
app.use('/files/download', dFiles)

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
})