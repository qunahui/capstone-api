const mongoose = require("mongoose");

const uri =
`mongodb+srv://${process.env.ATLAS_DATABASE_USER}:${process.env.ATLAS_DATABASE_PASSWORD}@admindashboard.ibniu.gcp.mongodb.net/${process.env.ATLAS_DATABASE_NAME}?retryWrites=true&w=majority`;
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
