var fs = require('fs');
const sharp = require("sharp");
const shortId = require("shortid");
const appRoot = require("app-root-path");
const { FoodModel, ChildFoodModel } = require('../model/FoodModel');
const { FoodSchema, ChildFoodSchema } = require('../validator/FoodSchema');
const nodeGeocoder = require('node-geocoder');
const PaymentModel = require('../model/PaymentModel');
const ZarinpalCheckout = require('zarinpal-checkout');
const zarinpal = ZarinpalCheckout.create('00000000-0000-0000-0000-000000000000', true);






class FoodController {


  async createFood(req, res) {
    try {
      await FoodSchema.validate(req.body)
      const image = req.files ? req.files.imageUrl : {};
      const fileName = `${shortId.generate()}_${image.name}`;
      await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
      const food = await new FoodModel({ title: req.body.title, imageUrl: fileName }).save();
      res.status(200).send({ food })
    } catch (err) {

      console.log(err);
    }
  }







  async getFoods(req, res) {
    try {
      let food = await FoodModel.find()
      res.status(200).send(food);
    } catch (err) {

    }
  }







  async editFood(req, res) {
    try {
      const food = await FoodModel.findById(req.params.id);
      const { title } = req.body

      let fileName = ""
      if (req.files.imageUrl) {
        const image = req.files.imageUrl;
        fileName = `${shortId.generate()}_${image.name}`;
        await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
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
      const del = await FoodModel.findByIdAndRemove(req.params.id)
      fs.unlinkSync(`${appRoot}/public/upload/${food.imageUrl}`)
      res.status(200).send({ food });
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
      const image = req.files ? req.files.imageUrl : {};
      const fileName = `${shortId.generate()}_${image.name}`;
      await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
      food.childFood.push({ title, price, info, imageUrl: fileName, commentId: req.params.id });
      food.save()
      res.status(200).send(food.childFood)
    } catch (err) {

      console.log(err);
    }
  }




  async getAllChildFood(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood
      res.status(200).send({ child })
    } catch (err) {

      console.log(err);
    }
  }




  async getSingleChildFood(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      res.status(200).send({ child })
    } catch (err) {

      console.log(err);
    }
  }





  async editChildFood(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      const { title, price, info } = req.body
      let fileName = ""
      if (req.files.imageUrl) {
        const image = req.files.imageUrl;
        fileName = `${shortId.generate()}_${image.name}`;
        await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
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
      fs.unlinkSync(`${appRoot}/public/upload/${child.imageUrl}`)
      res.status(200).send({ childFood });
    } catch (err) {

    }
  }




  async createCommentChildFood(req, res) {
    try {
      const { fullname, email, message } = req.body;
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      child.comment.push({ fullname, email, message });
      food.save()
      res.status(200).send({ ...child.comment })
    } catch (err) {

    }
  }




  async getCommentChildFood(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      res.status(200).json({ comment: child.comment })
    } catch (err) {

    }
  }





  // ! ChildFood
  // ! ChildFood





  // async getfoodplus(req, res) {

  //   try {
  //     let food = await FoodModel.find();
  //     food.map(async(f) => {
  //       let food2 = await FoodModel.findById(f._id);
  //       food2.price = 0
  //       food2.save()
  //       console.log(food2);
  //     })
  //     res.status(200).send({ food })
  //   } catch (err) {
  //     
  //     console.log(err);
  //   }

  // }


  // async editplus(req, res) {
  //   try {
  //     const food = await FoodModel.findById({ _id: req.params.id })
  //     const child = food.childFood.find((f) => f._id == req.query.id)
  //     const { num, total } = req.body
  //     let fileName = ""
  //     if (req.files.imageUrl) {
  //       const image = req.files.imageUrl;
  //       fileName = `${shortId.generate()}_${image.name}`;
  //       await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
  //       fs.unlinkSync(`${appRoot}/public/upload/${child.imageUrl}`)
  //     } else fileName = child.imageUrl
  //     child.title = title;
  //     child.price = price;
  //     child.info = info;
  //     child.imageUrl = fileName;
  //     await food.save();
  //     res.status(200).json({ childFood: child })
  //   }
  //   catch (err) { console.log(err) }

  // }







  // async editplus(req, res) {
  //   try {
  //     const food = await FoodModel.findById({ _id: req.params.id })
  //     const child = food.childFood.find((f) => f._id == req.query.id)
  //     const { num2, total2 } = req.body
  //     child.num2 = num2;
  //     child.total2 = total2;
  //     await food.save();
  //     console.log('num2 num2', num2);
  //     res.status(200).json({ childFood: child })
  //   }
  //   catch (err) { console.log(err) }

  // }








  async getfoodplus(req, res) {
    try {
      let food = await FoodModel.find();
      var ff = []
      for (let a of food) {
        for (let b of a.childFood) { ff.push(b) }
      }
      let d = ff.filter((f) => (f.total2 > 0))
      // console.log('sdsdsdsdsd', d);
      res.send(d)
    }
    catch (err) { console.log(err); }
  }



// getpayplus delpayplus getfoodplus  plus, minus


// getallchildfood payplus, editplus


  async payplus(req, res) {

    try {
      // console.log('req.body.price', req.body.price);
      const food = await FoodModel.findById({ _id: req.params.id })
      food.price = req.body.price
      food.save()
      res.status(200).send({ price: req.body.price })
    } catch (err) {

      console.log(err);
    }

  }



  async getpayplus(req, res) {

    try {
      const food = await FoodModel.find();
      console.log('aaaaa',food);
      const f = a.reduce((total, number) => total + number)
      res.status(200).send({ price: f })
    } catch (err) {

      console.log(err);
    }

  }



  async delpayplus(req, res) {

    try {
      let food = await FoodModel.find();
      food.map(async (f) => {
        let food2 = await FoodModel.findById(f._id);
        food2.price = 0
        food2.save()
        // console.log(food2);
      })
      res.status(200).send({ food })
    } catch (err) {

      console.log(err);
    }
  }




  async confirmPayment(req, res) {
    try {
      // console.log('req.user.email', req.user.payload);
      const food = await FoodModel.find();
      let a = food.map((f) => f.price)
      const f = a.reduce((total, number) => total + number)
      // console.log('ffffffff', food);
      const response = await zarinpal.PaymentRequest({
        Amount: f,
        CallbackURL: 'http://192.168.42.34/verifyPayment',
        Description: 'زستوران',
        Email: req.user.email, S
      });
      await new PaymentModel({
        user: req.user._id,
        fullname: req.user.fullname,
        email: req.user.email,
        title: 'زستوران',
        price: f,
        paymentCode: response.authority
      }).save();
      // console.log(response.url);
      res.status(200).send(response.url);
    }
    catch (err) {
      console.log(err)
      res.status(400).send("error")
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
        // console.log(payment);
        res.render("./paymant", {
          pageTitle: "Pardakht",
          path: "/Pardakht",
          fullname: payment.fullname,
          email: payment.email,
          title: payment.title,
          price: payment.price,
          refId: response.RefID
        })
      } else {
        // res.send('<div style=" padding:3px 0 2rem; width:30%; border:1px solid silver; margin:5rem auto ; text-align:center"><h1 style="margin:1rem 0 2rem;" >خطا پرداخت انجام نشد</h1><button onclick="window.location.assign(`http://localhost:3000`)" style=" padding:6px; border:1px solid silver; border-radius:3%; background:yellow; text-decoration:none;">برگشت به صفحه اصلی</button></div>')
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
      res.status(400).send("error")
    }
  }




  async notification(req, res) {
    try {
      const n = {
        channelId: "1",
        title: 'title',
        message: "hnhnhn",
        date: new Date(Date.now() + 1 * 1),
        allowWhileIdle: false,
      }

      res.send(n)
    }
    catch (er) {
      console.log(er)
      res.status(400).send("error")
    }

  }




  async reverse(req, res) {
    let options = { provider: 'openstreetmap' };
    let geoCoder = nodeGeocoder(options);

    geoCoder.reverse({ lat: req.body.latitude, lon: req.body.longitude })
      .then((re) => {
        res.send(re)
        console.log(re)
      })
      .catch((err) => console.log(err));
  }




  async geocode(req, res) {
    let options = { provider: 'openstreetmap' };
    let geoCoder = nodeGeocoder(options);

    geoCoder.geocode(req.body.loc)
      .then((re) => {
        res.send(re)
        console.log('re')
      })
      .catch((err) => console.log(err));
  }





  async plus(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      child.num = child.num + 1
      food.save()
      res.status(200).send({ num: child.num })
    } catch (err) {

      console.log(err);
    }
  }






  async minus(req, res) {
    try {
      const food = await FoodModel.findById({ _id: req.params.id })
      const child = food.childFood.find((f) => f._id == req.query.id)
      child.num = child.num - 1
      food.save()
      res.status(200).send({ num: child.num })
    } catch (err) {

      console.log(err);
    }
  }







}

exports.FoodController = new FoodController()





























//   async createSandwich(req, res) {
//     try {
//       await ChildFoodSchema.validate(req.body)
//       const food = await FoodModel.findOne({ _id: req.params.id, title:"sandwich" })

//       const { title, price, info } = req.body
//       const image = req.files ? req.files.imageUrl : {};
//       const fileName = `${shortId.generate()}_${image.name}`;
//       await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)

//       const sandwich = await new ChildFoodModel({ title, info, price, imageUrl: fileName }).save()

//       food.sandwich.push({ title, price, info, imageUrl: fileName, _id: sandwich._id });
//       food.save()
//       res.status(200).send(food.sandwich)
//     } catch (err) {
//       
//       console.log(err);
//     }
//   }




//   async getAllSandwich(req, res) {
//     try {
//       const sandwich = await ChildFoodModel.find()
//       res.status(200).send({sandwich})
//     } catch (err) {
//       
//       console.log(err);
//     }
//   }





//   async getSingleSandwich(req, res) {
//     try {
//       const sandwich = await ChildFoodModel.findById({ _id: req.params.id })
//       res.status(200).send({sandwich})
//     } catch (err) {
//       
//       console.log(err);
//     }
//   }





//   async editSandwich(req, res) {
//     try {
//       const sandwich = await ChildFoodModel.findById(req.params.id);
//       const { title, price, info } = req.body

//       let fileName = ""
//       if (req.files.imageUrl) {
//         const image = req.files.imageUrl;
//         fileName = `${shortId.generate()}_${image.name}`;
//         await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
//         fs.unlinkSync(`${appRoot}/public/upload/${sandwich.imageUrl}`)
//       } else fileName = sandwich.imageUrl

//       sandwich.title = title;
//       sandwich.price = price;
//       sandwich.info = info;
//       sandwich.imageUrl = fileName;
//       await sandwich.save();
//       res.status(200).json({ sandwich })
//     }
//     catch (err) { console.log(err) }
//   }




//   async deleteSandwich(req, res) {
//     try {
//       const sandwich = await ChildFoodModel.findById(req.params.id);
//       const del = await ChildFoodModel.findByIdAndRemove(req.params.id)
//       fs.unlinkSync(`${appRoot}/public/upload/${sandwich.imageUrl}`)
//       res.status(200).send({ sandwich });
//     } catch (err) {
//       
//     }
//   }






//   async createCommentSandwich(req, res) {
//     try {
//       const { fullname, email, message } = req.body;

//       const sandwich = await ChildFoodModel.findById({ _id: req.params.id })
//       sandwich.comment.push({ fullname, email, message });
//       sandwich.save()
//       res.status(200).send({ ...sandwich.comment })
//     } catch (err) {
//       
//     }
//   }




//   async getCommentSandwich(req, res) {
//     try {
//       const sandwich = await ChildFoodModel.findById({ _id: req.params.id });
//       res.status(200).json({ ...sandwich.comment })
//     } catch (err) {
//       
//     }
//   }




// // TODO req.query.id
// // ! req.query.name
// // ? req.query.name
// // * req.query.name




//   async createDrink(req, res) {
//     try {
//       await ChildFoodSchema.validate(req.body)
//       const food = await FoodModel.findOne({ _id: req.params.id , title:"drink" })

//       const { title, price, info } = req.body
//       const image = req.files ? req.files.imageUrl : {};
//       const fileName = `${shortId.generate()}_${image.name}`;
//       await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)

//      const childFood = await new ChildFoodModel({ title, info, price, imageUrl: fileName }).save()

//       food.childFood.push({ title, price, info, imageUrl: fileName, _id: childFood._id });
//       food.save()
//       res.status(200).send(food.childFood)
//     } catch (err) {
//       
//       console.log(err);
//     }
//   }




//   async getAllDrink(req, res) {
//     try {
//       const drink = await ChildFoodModel.find()
//       res.status(200).send({drink})
//     } catch (err) {
//       
//       console.log(err);
//     }
//   }





//   async getSingleDrink(req, res) {
//     try {
//       const drink = await ChildFoodModel.findById({ _id: req.params.id })
//       res.status(200).send({drink})
//     } catch (err) {
//       
//       console.log(err);
//     }
//   }





//   async editDrink(req, res) {
//     try {
//       const drink = await ChildFoodModel.findById(req.params.id);
//       const { title, price, info } = req.body

//       let fileName = ""
//       if (req.files.imageUrl) {
//         const image = req.files.imageUrl;
//         fileName = `${shortId.generate()}_${image.name}`;
//         await sharp(image.data).toFile(`${appRoot}/public/upload/${fileName}`)
//         fs.unlinkSync(`${appRoot}/public/upload/${drink.imageUrl}`)
//       } else fileName = drink.imageUrl

//       drink.title = title;
//       drink.price = price;
//       drink.info = info;
//       drink.imageUrl = fileName;
//       await drink.save();
//       res.status(200).json({ drink })
//     }
//     catch (err) { console.log(err) }
//   }




//   async deleteDrink(req, res) {
//     try {
//       const drink = await ChildFoodModel.findById(req.params.id);
//       const del = await ChildFoodModel.findByIdAndRemove(req.params.id)
//       fs.unlinkSync(`${appRoot}/public/upload/${drink.imageUrl}`)
//       res.status(200).send({ drink });
//     } catch (err) {
//       
//     }
//   }






//   async createCommentDrink(req, res) {
//     try {
//       const { fullname, email, message } = req.body;

//       const drink = await ChildFoodModel.findById({ _id: req.params.id })
//       drink.comment.push({ fullname, email, message });
//       drink.save()
//       res.status(200).send({ ...drink.comment })
//     } catch (err) {
//       
//     }
//   }




//   async getCommentDrink(req, res) {
//     try {
//       const drink = await ChildFoodModel.findById({ _id: req.params.id });
//       res.status(200).json({ ...drink.comment })
//     } catch (err) {
//       
//     }
//   }

