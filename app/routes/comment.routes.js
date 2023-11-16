module.exports = app => {
    const comment = require("../controllers/comment.controller");
  
    var router = require("express").Router();
    const token = require("../../app/auth/token");

    // router.get("/getUserById/:id",token.validateToken, user.findOne);
    // router.patch("/update/:id",token.validateToken, user.updateUser);

    // router.patch("/UpdateDp/:id", token.validateToken, user.updateDp);

    // router.post("/forgotPassword", user.forgotPassword);
    router.post("/", token.validateToken, comment.createComment );
    // router.post("/like-comment/:CommentId", token.validateToken, comment.likeComment);

    app.use("/api/comment", router);
  
  };
  