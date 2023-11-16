const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.tutorials = require("./tutorial.model.js")(mongoose);
db.users = require("./user.model.js")(mongoose);
db.post = require("./post.model.js")(mongoose);
db.comment = require("./comments.model.js")(mongoose);

module.exports = db;
