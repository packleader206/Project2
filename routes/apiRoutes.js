var db = require("../models");
var multer = require("multer");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "upload");
  },
  filename: function(req, file, cb) {
    // Make the filename unique by adding a timestamp
    cb(null, Date.now().toString() + "-" + file.originalname);
  }
});

var upload = multer({ storage: storage });

module.exports = function(app) {
  // Get all items
  app.get("/api/item", function(req, res) {
    db.Item.findAll({}).then(function(dbItem) {
      res.json(dbItem);
    });
  });

  // This post needs to be handled by multer for the file upload
  app.post("/api/newItem", upload.single("myImage"), function(req, res) {
    console.log(req.body);
    console.log(req.file);
    // req.body contains the text fields
    // add image path to body
    req.body.image = "images/" + req.file.filename;
    console.log(req.body);
    db.Item.create(req.body).then(res.redirect("/"));
  });

  app.post("/api/signUp", function(req, res) {
    db.User.findAll({}).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Delete an item by id
  app.delete("/api/item/:id", function(req, res) {
    db.Item.destroy({ where: { id: req.params.id } }).then(function(dbItem) {
      res.json(dbItem);
    });
  });
};
