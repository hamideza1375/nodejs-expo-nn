const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/UserModel');
const { UserSchema } = require('../validator/UserSchema');

const captchapng = require("captchapng");
var CAPTCHA_NUM = null;

const nodeCache = require("node-cache");
const myCache = new nodeCache({ stdTTL: 120, checkperiod: 150 })

var Kavenegar = require('kavenegar');
var api = Kavenegar.KavenegarApi({
  apikey: '6F39365A38764E6178634C794B3339655039706A6F4C425362707958716252414233316835514634754D453D'
});





class UserController {

  async register(req, res) {
    try {
      await UserSchema.validate(req.body)
      const { fullname, password, phone } = req.body
      let userPhone = await UserModel.findOne({ phone });
      if (userPhone) return res.status(400).json(" ایمیل موجود هست")

      const user = await UserModel.create({ fullname, password, phone });
      let userIndex = await UserModel.find();

      if (userIndex.length === 1) {
        userIndex[0].isAdmin = 'chief'
        userIndex[0].save()
        console.log(1)
      }
      console.log(userIndex);
      res.status(201).json({ user })
    } catch (err) {
      console.log(err)
    }
  }


  async login(req, res) {
    try {
      const user = await UserModel.findOne({ phone: req.body.phone });
      if (!user) { console.log('!user'); return res.status(400).json('کاربری با این ایمیل یافت نشد'); }
      const pass = await bcrypt.compare(req.body.password, user.password);
      if (!pass) { console.log('!pass'); return res.status(400).json('کاربری با این پسورد یافت نشد'); }
      const users = {
        isAdmin: user.isAdmin,
        userId: user._id.toString(),
        phone: user.phone,
        fullname: user.fullname,
      }
      const token = await jwt.sign(users, "secret", { expiresIn: req.body.remember });
      const getTok = jwt.decode(token, { complete: true })
      const exp = getTok.payload.exp.toString()

      if (parseInt(req.body.captcha) == CAPTCHA_NUM) {
        res.status(200).header(token).json({ token, exp, userId: user._id.toString() });
      } else throw new TypeError('مساوی نیست')
    } catch (err) {
      console.log(err)
    }
  }



  async resetPassword(req, res) {
    try {
      const { password, confirmPassword } = req.body;
      if (password === confirmPassword) {
        const user = await UserModel.findById({ _id: req.params.id });
        if (!user) return res.ststus(400).json("/404")
        user.password = password;
        await user.save();
        res.status(200).json("موفقیت بروزرسانی شد");
      }
    }
    catch (err) {
      console.log(err)
    }
  }



  async userAdmin(req, res) {
    try {
      const user = await UserModel.findOne({ phone: req.body.phone });
      console.log('user', user);
      if (!user) return res.status(400).json('khata');
      user.isAdmin = 'courier';
      await user.save();
      res.status(200).json('good');
    }
    catch (err) {
      console.log(err)
    }
  }


  async deleteAdmin(req, res) {
    try {
      const user = await UserModel.findOne({ phone: req.body.phone });
      console.log('user', user);
      if (!user) return res.status(400).json('khata');
      user.isAdmin = '';
      await user.save();
      res.status(200).json('good');
    }
    catch (err) {
      console.log(err)
    }
  }
  




  async captcha(req, res) {
    try {
      CAPTCHA_NUM = req.params.id
      var p = new captchapng(80, 30, CAPTCHA_NUM);
      p.color(0, 0, 0, 0);
      p.color(80, 80, 80, 255);
      var img = p.getBase64();
      var imgbase64 = Buffer.from(img, 'base64');
      res.send(imgbase64);
    }
    catch (err) {
      console.log(err)
    }
  }




  async sendcode(req, res) {
    try {
      const num = Math.floor(Math.random() * 90000 + 10000)
      myCache.set("phone", req.body.phone)
      myCache.set("code", num)

      api.Send({
        message: `ارسال کد از رستوران 
        Code: ${num}`,
        sender: "2000500666",
        receptor: req.body.phone,
      },
        function (response, status) {
          res.status(status).json(response)
        });

    }
    catch (err) {
      console.log(err)
    }
  }




  async verifycode(req, res) {
    try {
      let phone = myCache.get("phone");
      const user = await UserModel.findOne({ phone })
      let myCode = req.body.code;
      let myCd = myCache.get("code");
      console.log(myCode, myCd);

      if (myCode != myCd) res.status(400).json("اشتباه")
      else res.status(200).json(user._id)
    }
    catch (err) { console.log(err); }

  }


}


module.exports = new UserController();
