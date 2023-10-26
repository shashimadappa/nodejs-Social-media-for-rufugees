module.exports = app => {
    const user = require("../controllers/user.controller");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/create-user", user.createUser);
    router.patch("/update/:id", user.updateUser);
    router.post("/login", user.login);
  
    // Retrieve all Tutorials
    // router.get("/", tutorials.findAll);
    app.use("/api/user", router);
  
  };
  