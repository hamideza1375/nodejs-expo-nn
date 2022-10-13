const sharp = require("sharp");
const appRoot = require("app-root-path");
const { FoodModel } = require('../model/FoodModel');
const UserModel = require('../model/UserModel');
const NotifeeModel = require('../model/NotifeeModel');
const { CommentSchema, ConfirmPaymentShama } = require('../validator/FoodSchema');
const nodeGeocoder = require('node-geocoder');
const PaymentModel = require('../model/PaymentModel');
const ZarinpalCheckout = require('zarinpal-checkout');
const zarinpal = ZarinpalCheckout.create('00000000-0000-0000-0000-000000000000', true);
const { imageProfile } = require('../model/ImageProfile');
const AddressModel = require('../model/AddressModel');
let change = new Map();


class FoodController {

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


  async getSingleChildFood(req, res) {
    try {
      const user = req.user?.payload ? await UserModel.findById({ _id: req.user.payload.userId }) : {}
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      let permission = user?.CommentPermission ? user.CommentPermission.find((f) => (f == child._id)) : false
      res.status(200).json({ child, permission })
    } catch (err) {
      console.log(err);
    }
  }


  async createCommentChildFood(req, res) {
    try {
      const validate = await CommentSchema.validate(req.body)
      if (!validate) return res.status(400).send('err')
      if (!req.user) return res.status(400).send('err')
      const { message, allstar, starId, fullname, imageUrl, id } = req.body;
      const user = await UserModel.findById({ _id: req.user.payload.userId })
      console.log('user?.CommentPermission', user.CommentPermission);
      let uc = user && user.CommentPermission ? user.CommentPermission.find((uc) => uc === id) : null
      if (!uc && (req.user.payload.isAdmin !== 'chief')) return res.status(400).json('err')
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      let find = child.comment.findIndex((c) => (c.starId == req.user.payload.userId))
      if (!child.comment[find]) {
        child.comment.push({ message, allstar, starId, fullname, imageUrl })
        food.save()
      }
      else {
        child.comment[find].message = message
        child.comment[find].allstar = allstar
        food.save()
      }
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
      child.comment.length && child.comment.forEach((f, i) => { index = i + 1; m.push(f.allstar) })
      const totalStar = m.length ? m.reduce((total, number) => total + number) : 0
      let meanStar = totalStar && totalStar / index
      if (meanStar && change.get(req.query.id) != meanStar || child.comment.length != change.get(req.query.id + 'length')) {
        child.meanStar = meanStar
        await food.save()
        change.set(req.query.id, meanStar)
        change.set(req.query.id + 'length', child.comment.length)
      }
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
      const validate = await CommentSchema.validate(req.body)
      if (!validate) return res.status(400).send('err')
      const { message, allstar } = req.body;

      if (!req.user?.payload) return res.status(400).send('err')
      const user = await UserModel.findById({ _id: req.user.payload.userId })
      let uc = user && user.CommentPermission ? user.CommentPermission.find((uc) => uc === req.body.starId) : null

      if (!uc && req.user.payload.isAdmin !== 'chief') return res.status(400).json('err')

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
      if (!food) return res.status(400).send('err')
      if (!req.user?.payload) return res.status(400).send('err')

      const user = await UserModel.findById({ _id: req.user.payload.userId })
      let uc = user && user.CommentPermission ? user.CommentPermission.find((uc) => uc === req.body.userId) : null
      if (!uc && req.user.payload.isAdmin !== 'chief') return res.status(400).json('err')

      const child = food.childFood.find((f) => f._id == req.query.id)
      const childIndex = food.childFood.findIndex((f) => f._id == req.query.id)
      const comment = child.comment.filter((item) => item._id != req.query.commentid)
      food.childFood[childIndex].comment = comment
      food.save()
      res.status(200).json('comment')
    } catch (err) {

    }
  }


  async confirmPayment(req, res) {
    try {
      let foods = req.body.foods
      if (!req.user) return res.status(400).send('err')
      if (!req.body.floor) return res.status(385).send('err')
      if (!req.body.plaque) return res.status(385).send('err')
      const response = await zarinpal.PaymentRequest({
        Amount: req.query.allprice,
        CallbackURL: 'http://192.168.42.42/verifyPayment',
        Description: 'زستوران',
        Email: req.user.payload.email,
      });
      await new PaymentModel({
        user: req.user.payload.userId,
        fullname: req.user.payload.fullname,
        phone: req.user.payload.phone,
        title: foods[0],
        origin: JSON.parse(req.body.origin),
        floor: req.body.floor,
        plaque: req.body.plaque,
        formattedAddress: req.body.formattedAddress,
        streetName: req.body.streetName,
        price: req.query.allprice,
        paymentCode: response.authority
      }).save();

      const user = await UserModel.findById({ _id: req.user.payload.userId })
      for (let food of foods) {
        let uc = user.CommentPermission.find((uc) => uc == food)
        if (!uc) { user.CommentPermission = user.CommentPermission.concat(food) }
      }; await user.save()

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
      if (!payment) return res.status(400).send('err')
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
          origin: payment.origin,
          price: payment.price,
          createdAt: new Date(),
          id: allAddress.length ? allAddress[allAddress.length - 1].id + 1 : 1,
          formattedAddress: payment.formattedAddress,
          streetName: payment.streetName,
        }).save()
        res.redirect(`http://localhost:19006/VerifyPayment?qualification=ok&&fullname=${payment.fullname}&&price=${payment.price}&&phone=${payment.phone}&&refId=${response.RefID}&&floor=${payment.floor}&&plaque=${payment.plaque}&&formattedAddress=${payment.formattedAddress}&&createdAt=${JSON.stringify(new Date)}`)
      } else {
        res.redirect(`http://localhost:19006/VerifyPayment?qualification=error`)
      }
    }
    catch (err) {
      console.log(err)
    }
  }


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
    geoCoder.reverse({ lat: req.body.lat, lon: req.body.lng })
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
        console.log(re)
        res.json(re)
      })
      .catch((err) => console.log(err));
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


  async sendImageProfile(req, res) {
    try {
      if (!req.user?.payload?.userId) return res.status(400).json('err')
      await imageProfile.deleteMany({ user: req.user.payload.userId })
      const image = req.files.uri;
      if (!image) return res.status(400).json('err')
      const uri = (new Date().getTime() + Math.random() * 10000).toString() + '.jpg';
      await sharp(image.data).toFile(`${appRoot}/public/upload/profile/${uri}`)
      await new imageProfile({ uri: uri, user: req.user.payload.userId }).save()

      const food = await FoodModel.find()
      for (let i in food) {
        if (food[i])
          for (let n in food[i].childFood) {
            if (food[i].childFood[n]?.comment.length) {
              for (let y in food[i].childFood[n].comment) {
                if (food[i].childFood[n].comment[y].starId == req.user.payload.userId) {
                  food[i].childFood[n].comment[y].imageUrl = uri
                  await FoodModel.updateMany(
                    {_id: food[i]._id},
                    {childFood:food[i].childFood}
                  )
                }
              }
            }
          }
      }
      res.status(200).json('good')
    } catch (err) {
      console.log(err);
    }
  }

  

  async getImageProfile(req, res) {
    try {
      const uri = await imageProfile.findOne({ user: req.user?.payload && req.user.payload.userId })
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