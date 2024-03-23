module.exports = (app) => {
  const helpmycase = require("../controllers/helpmycase.controller");

  var router = require("express").Router();
  const token = require("../auth/token");

  router.post("/", token.validateToken, helpmycase.createFunds);
  router.get("/", token.validateToken, helpmycase.findAll);
  router.get("/:caseId", token.validateToken, helpmycase.findCaseById);
  router.delete("/:caseId", token.validateToken, helpmycase.deleteCase);
  router.patch("/:caseId", token.validateToken, helpmycase.updateCase)

  app.use("/api/helpmycase", router);
};
