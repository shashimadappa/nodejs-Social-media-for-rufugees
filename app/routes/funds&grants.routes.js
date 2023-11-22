module.exports = app => {
    const funds = require("../controllers/funds&grants.controller");
  
    var router = require("express").Router();
    const token = require("../auth/token");
    // router.get("/getUserById/:id",token.validateToken, user.findOne);
    // router.patch("/update/:id",token.validateToken, user.updateUser);
    // router.patch("/UpdateDp/:id", token.validateToken, user.updateDp);
    // router.post("/forgotPassword", user.forgotPassword);

    router.post("/", token.validateToken, funds.createFunds );
    router.get("/", token.validateToken, funds.findAll );
    // router.delete("/:postId",token.validateToken, Post.deletePost);

    // router.get("/:id",token.validateToken, Post.getAllById);
    // router.post("/likePost/:postId",token.validateToken, Post.likePost);

    app.use("/api/funds", router);
  
  };
  