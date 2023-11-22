// module.exports = app => {
//     const message = require("../controllers/message.controller");
  
//     var router = require("express").Router();
//     const token = require("../../app/auth/token");
    
//     router.post("/", token.validateToken, message.createMessage );
//     // router.get("/", token.validateToken, Post.findAll );
//     // router.post("/likePost/:postId",token.validateToken, Post.likePost);

//     app.use("/api/message", router);
  
//   };
  