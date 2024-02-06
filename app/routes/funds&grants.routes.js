module.exports = (app) => {
  const funds = require("../controllers/funds&grants.controller");

  var router = require("express").Router();
  const token = require("../auth/token");


  router.post("/", token.validateToken, funds.createFunds);
  router.get("/", token.validateToken, funds.findAll);
  router.delete("/:fundsId", token.validateToken, funds.deleteFunds);
  router.patch("/:fundsId", token.validateToken, funds.updateFunds);


  app.use("/api/funds", router);
};
