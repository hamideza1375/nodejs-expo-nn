const mongoose = require('mongoose');




const SchamaSender = new mongoose.Schema({
    name: String,
})

const SchamaMsgNm = new mongoose.Schema({
    name: String,
})


const MessageModels = new mongoose.Schema({
    msgNm: [SchamaMsgNm],
    id: String,
    roomNumber: String,
    msg: String,
    sender: { type: SchamaSender },
    number: { type: Number, default:1},
    createdAt: { type: Date, default: new Date() },
    uri: { type: String},
    type: { type: String, default: '' }

})

exports.MessageModels = mongoose.model('MessageModels', MessageModels)





const imageName = new mongoose.Schema({
    uri: String,
    name: String,
})


exports.imageName = mongoose.model('imageName', imageName)
