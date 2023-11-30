module.exports = app => {
    const Post = require("../controllers/post.controller");
    const multer = require("multer");

    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    var router = require("express").Router();
    const token = require("../../app/auth/token");
    // router.get("/getUserById/:id",token.validateToken, user.findOne);
    // router.patch("/update/:id",token.validateToken, user.updateUser);
    // router.patch("/UpdateDp/:id", token.validateToken, user.updateDp);
    // router.post("/forgotPassword", user.forgotPassword);
    router.post("/:userId", token.validateToken, upload.array('images'), Post.createPost );
    router.post("/2/:userId", token.validateToken, upload.array('images'), Post.createPost2 );
  
    router.delete("/:postId",token.validateToken, Post.deletePost);

    router.get("/", token.validateToken, Post.findAll );
    router.get("/:id",token.validateToken, Post.getAllById);

    router.post("/likePost/:postId",token.validateToken, Post.likePost);
    router.get("/numberOfLikes/:postId",token.validateToken, Post.getNoOfLikes);

    app.use("/api/post", router);
  
  };
  