const mongoose = require("mongoose");

const uri =
  "mongodb+srv://marverick:banhangauth@admindashboard.ibniu.gcp.mongodb.net/AdminDashboard?retryWrites=true&w=majority";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connects database successfully!");
  })
  .catch((error) => {
    console.log(error);
  });
