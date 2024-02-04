module.exports = (app) => {
  const comment = require("../controllers/comment.controller");

  var router = require("express").Router();
  const token = require("../../app/auth/token");

  router.get("/:postId", token.validateToken, comment.getAllComments);

  router.post("/", token.validateToken, comment.createComment);

  router.delete("/:commentId", token.validateToken, comment.deletePost);

  router.get("/getNoOfComments/:postId", token.validateToken, comment.getNoOfComments);

  app.use("/api/comment", router);
};
