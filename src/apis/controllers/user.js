const User = require("../models/user");
const Storage = require("../models/storage")
const jwt = require("jsonwebtoken");
const Error = require("../utils/error");
const nodemailer = require('nodemailer');
const ActivityLog = require('../models/activityLog')
const jwt = require("jsonwebtoken");
const sendMail = require('../../utils/ses_sendemail.js')

const sellerAccess = [
  'marketplaceProduct.create',
  'marketplaceProduct.read',
  'marketplaceProduct.update',
  'marketplaceProduct.delete',
  'marketplaceOrder.create',
  'marketplaceOrder.read',
  'marketplaceOrder.update',
  'marketplaceOrder.delete',
  'product.create',
  'product.read',
  'product.update',
  'product.delete',
  'order.create',
  'order.read',
  'order.update',
  'order.delete',
  'refundOrder.create',
  'refundOrder.read',
  'refundOrder.update',
  'refundOrder.delete',
  'purcharseOrder.create',
  'purcharseOrder.read',
  'purcharseOrder.update',
  'purcharseOrder.delete',
  'supplierRefundOrder.create',
  'supplierRefundOrder.read',
  'supplierRefundOrder.update',
  'supplierRefundOrder.delete',
  'config.create',
  'config.read',
  'config.update',
  'config.delete',
  'channel.create',
  'channel.read',
  'channel.update',
  'channel.delete',
  'report.create',
  'report.read',
  'report.update',
  'report.delete',
]

const option = {
  service: 'gmail',
  auth: {
      user: process.env.NODEMAILER_EMAIL, // email hoặc username
      pass: process.env.NODEMAILER_PASSWORD // password
  }
};

module.exports.changeDefaultStorage = async (req, res) => {
  const { id } = req.params;

  try {
    const newStorages = req.user.storages.map(i => {
      if(i.storage.current === true) {
        i.storage.current = false
      }
  
      if(i.storage.storageId.equals(id)) {
        i.storage.current = true
      }

      return i
    })
  
    await User.findOneAndUpdate({ _id: req.user._id}, {
      storages: newStorages
    })

    return res.status(200).send("ok")
  } catch (e) {
    console.log(e.message)
    return res.status(400).send(Error({ message: 'Đổi kho thất bại. Vui lòng thử lại sau! '}))
  }
}

module.exports.getCurrentUser = async (req, res) => {
  res.status(200).send({ user: req.user });
};

module.exports.signUp = async (req, res) => {
  try {
    const user = new User({ 
      ...req.body,
     });
    const storageName = 'STORAGE_' + user._id.toString().toUpperCase()
    const linkedStorage = new Storage({ displayName: storageName })
    await linkedStorage.save();
    user.storages = user.storages.concat({ 
      storage: {
        storageId: linkedStorage.id, 
        storageName: linkedStorage.displayName,
        role: 'Nhà bán hàng',
        roleAccess: sellerAccess,
        current: true
      } 
    });
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

    let now = new Date()

    const activityLog = new ActivityLog({
      storageId: user.storages.find(i => i.storage.current === true).storage.storageId,
      userId: user._id,
      userName: user.displayName,
      userRole: user.role,
      message: 'Đăng nhập vào hệ thống'
    })

    await activityLog.save()
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
          from: 'capstone.project.final@gmail.com', // Địa chỉ email của người gửi
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

module.exports.changePassword = async (req, res) => {
  
  try {
    const token = req.body.token
    const password = req.body.password
    const passToken = jwt.decode(token)

    const user = await User.findOne({ _id: passToken.userId })

    if(!user.changePassToken || user.changePassToken !== token) {
      return res.status(400).send(Error({ message: 'Token hết hiệu lực!' }))
    }

    if(passToken.type === "change-pass" ){
        if(Date.now() >= passToken.exp * 1000){
          const user = await User.findOne({_id: passToken.userId})
          user.password = password
          user.changePassToken = null
          await user.save()
          res.status(200).send("Ok")
        } else {
          res.status(403).send(Error({ message: 'Token hết thời hạn. Vui lòng gửi yêu cầu quên mật khẩu mới!' }));
        }
    }else{
      res.status(400).send(Error({ message: 'Lỗi không xác định, vui lòng thử lại sau!' }));
    }
    
  } catch (e) {
    res.status(404).send(Error(e));
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
      const email = req.query.email
      const user = await User.findOne({
        email
      })
      if(!user){
        res.status(400).send(Error({ message: "Tài khoản không tồn tại trong hệ thống!" }))
        return
      }
      const passToken = jwt.sign({ 
        userId: user._id.toString(),
        type: "change-pass"
      }, "thuongthuong", {
        expiresIn: '600'
      })

      await User.findOneAndUpdate({ email }, {
        changePassToken: passToken
      })

      sendMail({
        email,
        token: passToken
      })

  } catch (e) {
    console.log("Error: ", e)
    res.status(500).send(Error({ message: e.message }));
  }
};