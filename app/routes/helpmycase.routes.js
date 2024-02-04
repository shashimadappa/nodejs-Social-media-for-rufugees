module.exports = (app) => {
  const helpmycase = require("../controllers/helpmycase.controller");

  var router = require("express").Router();
  const token = require("../auth/token");

  router.post("/", token.validateToken, helpmycase.createFunds);
  router.get("/", token.validateToken, helpmycase.findAll);
  router.delete("/:caseId", token.validateToken, helpmycase.deleteCase);

  app.use("/api/helpmycase", router);
};
