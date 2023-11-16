module.exports = app => {
    const Post = require("../controllers/post.controller");
  
    var router = require("express").Router();
    const token = require("../../app/auth/token");

    // router.get("/getUserById/:id",token.validateToken, user.findOne);
    // router.patch("/update/:id",token.validateToken, user.updateUser);

    // router.patch("/UpdateDp/:id", token.validateToken, user.updateDp);

    // router.post("/forgotPassword", user.forgotPassword);
    router.post("/", token.validateToken, Post.createPost );
    router.get("/:id",token.validateToken, Post.getAllById);

    app.use("/api/post", router);
  
  };
  