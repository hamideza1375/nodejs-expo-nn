const Yup = require("yup");

exports.FoodSchema = Yup.object().shape({
    title: Yup.string().required(),
});

exports.ChildFoodSchema = Yup.object().shape({
    title: Yup.string().required(),
    price: Yup.number().required(),
    info: Yup.string().required(),
});

exports.CommentSchema = Yup.object().shape({
    message: Yup.string().required(),
    allstar: Yup.number().required(),
});

exports.NotifeeSchema = Yup.object().shape({
    title: Yup.string().required(),
    message: Yup.string().required(),
});