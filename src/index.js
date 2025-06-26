// require('dotenv').config({path:'../env'});

import 'dotenv/config'
import connectDB from './db/index.js';
import { app } from './app.js'


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port ${process.env.PORT || 8000}`);
    });
})
.catch((error)=>{
    console.log('mongodb connection failed ',error);
})