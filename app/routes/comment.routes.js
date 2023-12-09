module.exports = (app) => {
  const comment = require("../controllers/comment.controller");

  var router = require("express").Router();
  const token = require("../../app/auth/token");

  router.get("/:postId", token.validateToken, comment.getAllComments);

  router.post("/", token.validateToken, comment.createComment);
  router.delete("/:commentId", token.validateToken, comment.deletePost);

  app.use("/api/comment", router);
};
