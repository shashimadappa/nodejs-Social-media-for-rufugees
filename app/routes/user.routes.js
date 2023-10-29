module.exports = app => {
    const user = require("../controllers/user.controller");
  
    var router = require("express").Router();
    const token = require("../../app/auth/token");
  
    // Create a new Tutorial
    router.post("/create-user", user.createUser);
    router.post("/login", user.login);

    router.get("/getUserById/:id",token.validateToken, user.findOne);
    router.patch("/update/:id",token.validateToken, user.updateUser);

    router.patch("/UpdateDp/:id", token.validateToken, user.updateDp);

    router.post("/forgotPassword", user.forgotPassword);
    router.post("/resetForgotPassword", user.resetForgotPassword);

    app.use("/api/user", router);
  
  };
  