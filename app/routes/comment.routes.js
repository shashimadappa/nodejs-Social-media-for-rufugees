module.exports = app => {
    const comment = require("../controllers/comment.controller");
  
    var router = require("express").Router();
    const token = require("../../app/auth/token");

    router.get("/:postId",token.validateToken, comment.getAllComments);
    // router.patch("/update/:id",token.validateToken, user.updateUser);

    // router.patch("/UpdateDp/:id", token.validateToken, user.updateDp);

    // router.post("/forgotPassword", user.forgotPassword);
    router.post("/", token.validateToken, comment.createComment ); 
    router.delete("/:commentId", token.validateToken, comment.deletePost );
    // router.post("/like-comment/:CommentId", token.validateToken, comment.likeComment);

    app.use("/api/comment", router);
  
  };
  