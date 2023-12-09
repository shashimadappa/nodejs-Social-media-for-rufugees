module.exports = (app) => {
  const user = require("../controllers/user.controller");

  var router = require("express").Router();
  const token = require("../../app/auth/token");

  router.post("/create-user", user.createUser);
  router.post("/login", user.login);

  router.patch("/update/:id", token.validateToken, user.updateUser);

  router.patch("/UpdateDp/:id", token.validateToken, user.updateDp);

  router.post("/forgotPassword", user.forgotPassword);
  router.post("/resetForgotPassword", user.resetForgotPassword);

  router.get("/findByLocation", token.validateToken, user.findByLocation);
  router.get("/getUserById/:id", token.validateToken, user.findOne);

  router.get(
    "/getUserByuniqueId/:uniqueId",
    token.validateToken,
    user.findOneByUniqueId
  );

  app.use("/api/user", router);
};
