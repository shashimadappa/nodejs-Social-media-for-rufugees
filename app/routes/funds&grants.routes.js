module.exports = (app) => {
  const funds = require("../controllers/funds&grants.controller");

  var router = require("express").Router();
  const token = require("../auth/token");


  router.post("/", token.validateToken, funds.createFunds);
  router.get("/", token.validateToken, funds.findAll);


  app.use("/api/funds", router);
};
