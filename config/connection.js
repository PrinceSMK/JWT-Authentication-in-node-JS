const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.pluralize(null);
mongoose.connect('mongodb://127.0.0.1:27017/jwtauth',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then((req,res)=>{
    console.log("Database connected successfully");
}).catch((req,res,error)=>{
    console.log("Error while connecting Database"+ error);
})