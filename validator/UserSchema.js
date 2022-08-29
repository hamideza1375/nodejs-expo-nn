const Yup = require("yup");



exports.UserSchema = Yup.object().shape({
    fullname: Yup.string().required().min(3).max(50),
  
    phone: Yup.string().required(),
 
    password: Yup.string().min(4).max(255).required(),

    // repeatPassword: Yup.string().required().oneOf([Yup.ref("password"), null]),
});

