module.exports = app => {
    const helpmycase = require("../controllers/helpmycase.controller");
  
    var router = require("express").Router();
    const token = require("../auth/token");

    router.post("/", token.validateToken, helpmycase.createFunds );
    router.get("/", token.validateToken, helpmycase.findAll );


    app.use("/api/helpmycase", router);
  
  };
  