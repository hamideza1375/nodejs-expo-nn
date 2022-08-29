var fs = require('fs');
const sharp = require("sharp");
const shortId = require("shortid");
const appRoot = require("app-root-path");
const { FoodModel } = require('../model/FoodModel');
const UserModel = require('../model/UserModel');
const NotifeeModel = require('../model/NotifeeModel');
const { FoodSchema, ChildFoodSchema, NotifeeSchema, CommentSchema } = require('../validator/FoodSchema');
const nodeGeocoder = require('node-geocoder');
const PaymentModel = require('../model/PaymentModel');
const ZarinpalCheckout = require('zarinpal-checkout');
const zarinpal = ZarinpalCheckout.create('00000000-0000-0000-0000-000000000000', true);
const { imageProfile } = require('../model/ImageProfile');
const AddressModel = require('../model/AddressModel');





class FoodController {


  async createFood(req, res) {
    try {
      await FoodSchema.validate(req.body)
      if (!req.files) return res.status(400).json('err')
      const image = req.files.imageUrl;
      const fileName = `${shortId.generate()}_${image.name}`;
      await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
      const food = await new FoodModel({ title: req.body.title, imageUrl: fileName }).save();
      res.status(200).json({ food })
    } catch (err) {
      console.log(err);
    }
  }



  async getFoods(req, res) {
    try {
      let food = await FoodModel.find()
      res.status(200).json(food);
    } catch (err) {
    }
  }


  async getSingleTitleFoods(req, res) {
    try {
      let food = await FoodModel.findById(req.params.id)
      res.status(200).json(food);
    } catch (err) {
      console.log(err);
    }
  }



  async getFood(req, res) {
    try {
      let food = await FoodModel.find(req.params.id)
      res.status(200).json(food);
    } catch (err) {

    }
  }



  async editFood(req, res) {
    try {
      await FoodSchema.validate(req.body)
      const food = await FoodModel.findById(req.params.id);
      const { title } = req.body
      let fileName = ""
      if (req.files) {
        const image = req.files.imageUrl;
        fileName = `${shortId.generate()}_${image.name}`;
        await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)

        if (fs.existsSync(`${appRoot}/public/upload/${food.imageUrl}`))
          fs.unlinkSync(`${appRoot}/public/upload/${food.imageUrl}`)

      } else fileName = food.imageUrl

      food.title = title;
      food.imageUrl = fileName;
      await food.save();
      res.status(200).json({ food })
    }
    catch (err) { console.log(err) }
  }



  async deleteFood(req, res) {
    try {
      const food = await FoodModel.findById(req.params.id);
      await FoodModel.findByIdAndRemove(req.params.id)
      if (fs.existsSync(`${appRoot}/public/upload/${food.imageUrl}`))
        fs.unlinkSync(`${appRoot}/public/upload/${food.imageUrl}`)
      res.status(200).json({ food });
    } catch (err) {

    }
  }




  // ! ChildFood
  // ! ChildFood




  async createChildFood(req, res) {
    try {
      await ChildFoodSchema.validate(req.body)
      const food = await FoodModel.findById({ _id: req.params.id })
      const { title, price, info } = req.body
      if (!req.files) return res.status(400).json('err')
      const image = req.files.imageUrl;
      const fileName = `${shortId.generate()}_${image.name}`;
      await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
      food.childFood.push({
        title, price, info, imageUrl: fileName, commentId: req.params.id,
        refId: req.params.id
      });
      food.save()
      res.status(200).json(food.childFood)
    } catch (err) {

      console.log(err);
    }
  }


  async getAllChildFood(req, res) {
    try {
      const food = await FoodModel.find()
      const child = []

      for (let n of food) {
        for (let i of n.childFood) {

          child.push(i);
        }
      }

      res.status(200).json({ child })
    } catch (err) {

      console.log(err);
    }
  }


  // async getStar(req, res) {
  //   try {
  //     const child = food.childFood.find((f) => f._id == req.query.id)
  //     let m = []
  //     let index = null
  //     child.comment.forEach((f, i) => { index = i + 1; m.push(f.allstar) })
  //     const totalStar = m.reduce((total, number) => total + number)
  //     let mean = totalStar / index
  //     res.status(200).json({ mean })
  //   } catch (err) {

  //   }
  // }





  async getSingleChildFood(req, res) {
    try {
      const user = await UserModel.findById({ _id: req.user.payload.userId })
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)

      let permission = user.CommentPermission.find((f) => (f == child.title))

      res.status(200).json({ child, permission })
    } catch (err) {

      console.log(err);
    }
  }





  async editChildFood(req, res) {
    try {
      await ChildFoodSchema.validate(req.body)
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      const { title, price, info } = req.body
      let fileName = ""
      if (req.files) {
        const image = req.files.imageUrl;
        fileName = `${shortId.generate()}_${image.name}`;
        await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
        if (fs.existsSync(`${appRoot}/public/upload/${child.imageUrl}`))
          fs.unlinkSync(`${appRoot}/public/upload/${child.imageUrl}`)
      } else fileName = child.imageUrl
      child.title = title;
      child.price = price;
      child.info = info;
      child.imageUrl = fileName;
      await food.save();
      res.status(200).json({ childFood: child })
    }
    catch (err) { console.log(err) }
  }




  async deleteChildFood(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      const delChild = food.childFood.filter((f) => f._id != req.query.id)
      food.childFood = delChild
      food.save()
      if (fs.existsSync(`${appRoot}/public/upload/${child.imageUrl}`))
        fs.unlinkSync(`${appRoot}/public/upload/${child.imageUrl}`)
      res.status(200).json({ childFood });
    } catch (err) {

    }
  }




  async createCommentChildFood(req, res) {
    try {
      await CommentSchema.validate(req.body)
      const { message, allstar, title } = req.body;
      const user = await UserModel.findById({ _id: req.user.payload.userId })
      let uc = user.CommentPermission.find((uc) => uc === title)
      if (!uc) return res.status(400).json('err')
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      child.comment.push({ message, allstar });
      food.save()
      res.status(200).json({ ...child.comment })
    } catch (err) {
      console.log(err);
    }
  }



  async getCommentChildFood(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)

      let m = []
      let index = null
      child.comment.forEach((f, i) => { index = i + 1; m.push(f.allstar) })
      const totalStar = m.reduce((total, number) => total + number)
      let meanStar = totalStar / index
      child.meanStar = meanStar
      await food.save()
      // console.log('food.meanStar.meanStar', child.meanStar);
      res.status(200).json({ comment: child.comment })
    } catch (err) {

    }
  }




  async getCommentSingleFood(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const allChild = food.childFood.find((f) => f._id == req.query.id)
      const child = allChild.comment.find((f) => f._id == req.query.single_id)

      res.status(200).json({ comment: child })
    } catch (err) {

    }
  }





  async editcomment(req, res) {
    try {
      await CommentSchema.validate(req.body)
      const { message, allstar } = req.body;
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      const comment = child.comment.find((f) => f._id == req.query.commentid)
      comment.message = message
      comment.allstar = allstar
      food.save()
      res.status(200).json({ comment })
    } catch (err) {

    }
  }






  async deletecomment(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      const childIndex = food.childFood.findIndex((f) => f._id == req.query.id)
      const comment = child.comment.filter((item) => item._id != req.query.commentid)
      food.childFood[childIndex].comment = comment
      food.save()
      res.status(200).json('comment')
    } catch (err) {

    }
  }



  // ! ChildFood
  // ! ChildFood 

  async confirmPayment(req, res) {
    try {
      const response = await zarinpal.PaymentRequest({
        Amount: req.query.allprice,
        CallbackURL: 'http://localhost/verifyPayment',
        Description: 'زستوران',
        Email: req.user.payload.email,
      });
      await new PaymentModel({
        user: req.user.payload.userId,
        fullname: req.user.payload.fullname,
        phone: req.user.payload.phone,
        title: req.body.foods[0],
        floor: req.body.floor,
        plaque: req.body.plaque,
        formattedAddress: req.body.formattedAddress,
        price: req.query.allprice,
        paymentCode: response.authority
      }).save();
      const user = await UserModel.findById({ _id: req.user.payload.userId })

      for (let food of req.body.foods) {
        let uc = user.CommentPermission.find((uc) => uc == food)
        if (!uc) {
          user.CommentPermission = user.CommentPermission.concat(food)
        }
      }
      await user.save()
      res.status(200).json(response.url);
    }
    catch (err) {
      console.log(err)
    }
  }




  async verifyPayment(req, res) {
    try {
      const paymentCode = req.query.Authority;
      const status = req.query.Status;
      const payment = await PaymentModel.findOne({ paymentCode });
      const response = await zarinpal.PaymentVerification({
        Amount: payment.price, Authority: paymentCode
      });
      if (status === "OK") {
        payment.refId = response.RefID;
        payment.success = true;
        await payment.save();

      const allAddress = await AddressModel.find();


        await new AddressModel({
          user: payment.user,
          fullname: payment.fullname,
          phone: payment.phone,
          floor: payment.floor,
          plaque: payment.plaque,
          price: payment.price,
          createdAt:new Date(),
          id:allAddress.length? allAddress[allAddress.length - 1].id + 1:1,
          formattedAddress: payment.formattedAddress
        }).save()


        res.render("./paymant", {
          pageTitle: "Pardakht",
          path: "/Pardakht",
          fullname: payment.fullname,
          phone: payment.phone,
          title: payment.title,
          price: payment.price,
          refId: response.RefID,
          paymentCode: paymentCode
        })


      } else {
        res.send(`
        <div style="padding:3px 0 2rem;width:30%;border:1px solid silver;margin:5rem auto;text-align:center">
         <h1 style="margin:1rem 0 2rem;" >خطا پرداخت انجام نشد</h1>
         <button onclick="window.history.back()" style=" padding:6px; border:1px solid silver; border-radius:3%;background:yellow; text-decoration:none;">برگشت به صفحه اصلی</button>
         </div>
          `)
      }
    }
    catch (err) {
      console.log(err)
    }
  }



  async getAllAddress(req, res) {
    try {
      const allAddress = await AddressModel.find().sort({ createdAt: -1 });
      if (req.user && req.user.payload.isAdmin) return res.json(allAddress)
      else return res.json([])
    }
    catch (er) {
      console.log(er)
    }
  }


  async deleteAddress(req, res) {
    try {
      if (req.user.payload.isAdmin === 'chief')
        await AddressModel.findByIdAndRemove({ _id: req.params.id })
      else if(req.user.payload.isAdmin === 'courier') {
        let address = await AddressModel.findOne({ _id: req.params.id })
        // address.delele = req.user.payload.userId
        address.del = req.user.payload.userId
        address.save()
      }
      res.json("del")
    }
    catch (er) {
      console.log(er)
    }
  }


  async createNotification(req, res) {
    try {
      await NotifeeSchema.validate(req.body)
      await NotifeeModel.deleteMany()
      await new NotifeeModel({ title: req.body.title, message: req.body.message }).save()
      setTimeout(async () => { await NotifeeModel.deleteMany() }, 60000 * 60 * 12 * 2)
      res.json('good')
    }
    catch (er) {
      console.log(er)
    }
  }

  // not[not.length - 1]
  async notification(req, res) {
    try {
      let not = await NotifeeModel.findOne()

      not ?
        res.status(200).json({ title: not.title, message: not.message })
        :
        res.status(200).json({ title: '', message: '' })
    }
    catch (er) {
      console.log(er)
    }
  }




  async reverse(req, res) {
    let options = { provider: 'openstreetmap' };
    let geoCoder = nodeGeocoder(options);
    geoCoder.reverse({ lat: req.body.latitude, lon: req.body.longitude })
      .then((re) => {
        res.json(re)
      })
      .catch((err) => console.log(err));
  }




  async geocode(req, res) {
    let options = { provider: 'openstreetmap' };
    let geoCoder = nodeGeocoder(options);

    geoCoder.geocode(req.body.loc)
      .then((re) => {
        res.json(re)
      })
      .catch((err) => console.log(err));
  }







  async unAvailable(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      let fd = food.childFood.find((f) => (f._id == req.query._id))
      console.log(fd)
      fd.available = req.body.available
      food.save()
      res.status(200).json('good')
    } catch (err) {

      console.log(err);
    }
  }




  async listAvailable(req, res) {
    try {
      const food = await FoodModel.find()
      let fd = ''
      let fd2 = []
      food.forEach((f1) => {
        fd = f1.childFood.filter((f) => (f.available == false))
        fd.forEach((f2) => { fd2.push(f2) })
      })
      console.log(fd2)
      res.status(200).json(fd2)
    } catch (err) {

      console.log(err);
    }
  }




  async imagechat(req, res) {
    try {
      const image = req.files.uri;
      if (!image) return res.status(400).send(err)
      const fileName = req.body.name;
      await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
      res.status(200).json(fileName)
    } catch (err) {
      console.log(err);
    }
  }


  async sendProfile(req, res) {
    try {
      await imageProfile.deleteMany({ user: req.user.payload.userId })
      const image = req.files.uri;
      console.log('image', image)
      if (!image) return res.status(400).json('err')
      const uri = (new Date().getTime() + Math.random() * 10000).toString() + '.jpg';
      await sharp(image.data).toFile(`${appRoot}/public/upload/${uri}`)
      await new imageProfile({ uri: uri, user: req.user.payload.userId }).save()
      res.status(200).json('good')
    } catch (err) {
      console.log(err);
    }
  }




  async getProfile(req, res) {
    try {
      const uri = await imageProfile.findOne({ user: req.user.payload.userId })
      if (uri)
        res.status(200).json({ uri: uri.uri })
      else
        res.status(200).json(null)
    } catch (err) {
      console.log(err);
    }
  }




}

exports.FoodController = new FoodController()
