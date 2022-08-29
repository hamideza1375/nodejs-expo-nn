const router = require('express').Router();
const {FoodController: Food} = require('../controllers/FoodController');
const Auth = require('../middleware/Auth');

// getallchildfood 

// getpayplus delpayplus plus, minus, payplus 


router.put('/editcomment/:id', Food.editcomment);
router.delete('/deletecomment/:id', Food.deletecomment);

// Food 
router.post('/createfood', Food.createFood);
router.get('/getfoods', Food.getFoods);
router.get('/getsingletitlefoods/:id', Food.getSingleTitleFoods);
router.get('/getfood/:id', Food.getFood);
router.put('/editfood/:id', Food.editFood);
router.delete('/deletefood/:id', Food.deleteFood);
// Food
// Piza
router.post('/createchildfood/:id', Food.createChildFood);
router.get('/getallchildfood/:id', Food.getAllChildFood);
router.get('/getsinglechildfood/:id',Auth, Food.getSingleChildFood);
router.put('/editchildfood/:id', Food.editChildFood);
// router.delete('/deletechildfood/:id', Food.deleteChildFood);
router.delete('/deletechildfood/:id', Food.deleteChildFood);
router.post('/createcommentchildfood/:id', Auth, Food.createCommentChildFood);
router.get('/getcommentchildfood/:id', Food.getCommentChildFood);
router.get('/getcommentsinglefood/:id', Food.getCommentSingleFood);
// Piza
// Payment 
router.post('/confirmpayment', Auth, Food.confirmPayment);
router.get('/verifypayment', Food.verifyPayment);
// Payment
// Geocode
router.post('/reverse', Food.reverse);
router.post('/geocode', Food.geocode);
// Geocode
// notification
router.post('/createnotification', Food.createNotification);
router.get('/notification', Food.notification);

router.post('/imagechat', Food.imagechat);
router.post('/unavailable/:id', Food.unAvailable);
router.get('/listavailable', Food.listAvailable);
router.post('/sendprofile',Auth, Food.sendProfile);
router.get('/getprofile',Auth, Food.getProfile);

// getAllAddress
router.get('/getAllAddress',Auth ,Food.getAllAddress);

router.delete('/deleteaddress/:id',Auth, Food.deleteAddress);

module.exports = router















/*
// Sandwich
router.post('/createsandwich/:id', Food.createSandwich);
router.get('/getallsandwich', Food.getAllSandwich);
router.get('/getsinglesandwich/:id', Food.getSingleSandwich);
router.put('/editsandwich/:id', Food.editSandwich);
router.delete('/deletesandwich/:id', Food.deleteSandwich);
router.post('/createcommentsandwich/:id', Food.createCommentSandwich);
router.get('/getcommentsandwich/:id', Food.getCommentSandwich);
// Sandwich
// Drink
router.post('/createdrink/:id', Food.createDrink);
router.get('/getalldrink', Food.getAllDrink);
router.get('/getsingledrink/:id', Food.getSingleDrink);
router.put('/editdrink/:id', Food.editDrink);
router.delete('/deletedrink/:id', Food.deleteDrink);
router.post('/createcommentdrink/:id', Food.createCommentDrink);
router.get('/getcommentdrink/:id', Food.getCommentDrink);
// Drink
*/