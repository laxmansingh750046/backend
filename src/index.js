import 'dotenv/config'
import connectDB from './db/index.js';
import {app} from './app.js'


connectDB()
.then(()=>{
    const server = app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port ${process.env.PORT || 8000}`);
    });

    server.on("error", (err)=>{
        console.log("Server error:", err);
        process.exit(1);
    });
})
.catch((err)=>{
    console.log("mongo db connection fail !!!", err);
    process.exit(1);
})
