var fs = require('fs');
const appRoot = require("app-root-path");
const express = require("express");
const mongoose = require('mongoose');
const expressLayout = require("express-ejs-layouts");
const fileUpload = require("express-fileupload");
const dotEnv = require("dotenv");
dotEnv.config({ path: "./config/config.env" });
const { setHeaders } = require("./middleware/headers");
const Food = require("./router/FoodRouter");
const User = require("./router/UserRouter");
const Admin = require("./router/AdminRouter");
const { MessageModels } = require('./model/MessageModels');

const io = require("socket.io");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(setHeaders);
app.use(express.static("public"));
app.use(express.static("node_modules"));
 

app.use(expressLayout);
app.set('view engine', 'ejs');
app.set("layout", "./mainLayout");
app.set('views', './views');


app.use(fileUpload());




app.get("/map",(req, res) => {
  res.render("./map", {
    pageTitle: "map",
    path: "/map",
    search:''
  })});



app.use(Food)
app.use(User)
app.use(Admin)

app.use((req, res) => {
    res.send("<h1 style='text-align:center;color:red; font-size:55px'> 404 </h1>");
});



const port = 80

const server = app.listen(port, (err) => { console.log(`App Listen to port ${port}`) })





const ioo = io(server);




// "mongodb+srv://rezahami:1234512345@cluster0.vsfm0.mongodb.net/nodefood3?retryWrites=true&w=majority",

mongoose.connect(
"mongodb://localhost:27017/amozesh",
    {
        useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => console.log('db connected'))
    .catch((err) => console.error('db not connected', err));


    let users = []

  ioo.on("connection", (socket) => {

  let iid = socket.id


  socket.on("online", async (data) => {
    try {
      socket.join(data.roomNumber);
      users.push({ id: socket.id, nickname: data.nickname, gender: data.gender, roomNumber: data.roomNumber });
      const msgModel = await MessageModels.find()
      ioo.sockets.emit("mongoMsg", msgModel);
      ioo.sockets.emit("online", users);
    } 
    catch (err) {
      console.log(err);
    }
  });

  socket.on("chat message", async (message) => {
    try {
          await new MessageModels({ ...message }).save()
          ioo.to(message.roomNumber).emit("chat message", { ...message });
    } catch (err) { console.log(err); }
  });


  socket.on("deleteOne", async (id, data) => {
    try {
      let message = await MessageModels.findOne({ id: id })
      console.log(message);
      message.msgNm = data.name
      message.save()
      socket.emit("deleteOne", id);
    } catch (err) { console.log(err); }

  });


  socket.on("deleteMsg", async (id) => {
    try {
      let message = await MessageModels.findOne({ id: id })
      console.log(message);
      if(fs.existsSync(`${appRoot}/public/upload/${message.uri}`))
      fs.unlinkSync(`${appRoot}/public/upload/${message.uri}`)
      await MessageModels.deleteOne({ id: id })
      ioo.sockets.emit("deleteMsg", id);
    } catch (err) { console.log(err); }

  });

  socket.on("pvChat", (data) => {
    try {
      ioo.sockets.emit("pvChat", data, iid, users);
    } catch (err) { console.log(err); }

  });



  socket.on("typing", (data) => {
    try {
      socket.broadcast.in(data.roomNumber).emit("typing", data);
    } catch (err) { console.log(err); }

  });



  socket.on("disconnect", (idid) => {
    try {
      const users1 = users.filter((user) => user.id !== socket.id)
      ioo.sockets.emit("online", users = users1);
    } catch (err) { console.log(err); }
  })



  socket.on("delRemove", (idid) => {
    try {
      console.log(idid);
      const users1 = users.filter((user) => user.id !== socket.id)
      ioo.sockets.emit("online", users = users1);
      // ioo.sockets.emit("delRemove", users = users1 );
    } catch (err) { console.log(err); }

  })

});
