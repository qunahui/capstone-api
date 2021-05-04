const User = require("../models/user");
const Storage = require("../models/storage")
const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const nodemailer = require('nodemailer');

const option = {
  service: 'gmail',
  auth: {
      user: 'clonelocpro1@gmail.com', // email hoặc username
      pass: 'nhoxloctran!@#' // password
  }
};

console.log(process.env.API_URL)


module.exports.getCurrentUser = async (req, res) => {
  res.status(200).send({ user: req.user });
};

module.exports.signUp = async (req, res) => {
  try {
    const user = new User({ ...req.body });
    const storageName = 'STORAGE_' + user._id.toString().toUpperCase()
    const linkedStorage = new Storage({ displayName: storageName })
    await linkedStorage.save();
    user.storages = user.storages.concat({ storage: {storageId: linkedStorage.id, storageName: linkedStorage.displayName} });
    await user.save();
    
    const token = await user.generateJWT();
    res.status(201).send({ user, token});
  } catch (e) {
    let status = 400;
    let error = e;

    console.log("error: ", e)

    if (e.name === "MongoError" && e.code === 11000) {
      status = 409;
      error = {
        message: "User already exist!",
      };
    }

    res.status(status).send(Error(error));
  }
};

module.exports.signIn = async (req, res) => {
  try {
    var user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateJWT();
    return res.send({ user, token });
  } catch (e) {
    res.status(401).send(Error(e));
  }
};

module.exports.signOut = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((item) => {
      return item.token !== req.mongoToken;
    });

    await req.user.save();
    res.status(200).send("Signed out");
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.signOutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
};

module.exports.editProfile = async (req, res) => {
  const properties = Object.keys(req.body);
  console.log(properties)

  try {
    const user = req.user;

    properties.forEach((prop) => (user[prop] = req.body[prop]));

    await user.save();
    res.send(user);
  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.isDeleted = true;

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.sendMailResetPW = async (req, res) => {
  const transporter = nodemailer.createTransport(option);
  const email  = req.body.email
  transporter.verify(function(error, success) {
    // Nếu có lỗi.
    if (error) {
        console.log(error);
    } else { //Nếu thành công.
        console.log('Kết nối thành công!');

        const mail = {
          from: 'clonelocpro1@gmail.com', // Địa chỉ email của người gửi
          to: email, // Địa chỉ email của người gửi
          subject: 'Thư được gửi bằng Node.js', // Tiêu đề mail
          text: 'bố reset pw cho lần này thôi nhé!', // Nội dung mail dạng text
          //html :  url: localhost:3000/.... + token
        };
      
        transporter.sendMail(mail, function(error, info) {
          if (error) { // nếu có lỗi
              console.log(error);
          } else { //nếu thành công
              console.log('Email sent: ' + info.response);
              res.send("done")
          }
        });
    }

  });

  
};

module.exports.resetPassword = async (req, res) => {
  const token = req.body.token
  const password = req.body.password
  
  //so sánh token

  try {
    //findOneAndUpdate
  } catch (e) {
    res.status(404).send(Error(e));
  }
};