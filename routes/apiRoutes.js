var db = require("../models");
var multer = require("multer");
var aws = require("aws-sdk");
var multerS3 = require("multer-s3");

var s3 = new aws.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET
});
var useS3;
var storage;

if (!process.env.S3_KEY) {
  useS3 = false;
  console.log("No S3 Key available. Using local upload");
  storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "upload");
    },
    filename: function(req, file, cb) {
      // Make the filename unique by adding a timestamp
      cb(null, Date.now().toString() + "-" + file.originalname);
    }
  });
} else {
  useS3 = true;
  console.log("Using S3 key: " + process.env.S3_KEY);
  storage = multerS3({
    s3: s3,
    bucket: "phoenix-project2",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function(req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    }
  });
}

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

    var image;
    if (!req.file) {
      // If no file was selected we use a placeholder
      image = "/images/placeholder.png";
    } else if (useS3) {
      image = req.file.location;
    } else {
      image = "/images/" + req.file.filename;
    }

    db.Item.create({
      title: req.body.title,
      categories: req.body.categories,
      description: req.body.description,
      price: req.body.price,
      sellerContact: req.body.sellerContact,
      image: image,
      userId: req.session.user.id
    }).then(function() {
      res.redirect("/");
    });
  });

  app.post("/api/signUp", function(req, res) {
    db.User.findAll({}).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Delete an item by id
  app.delete("/userProfile", function(req, res) {
    db.Item.destroy({ where: { id: req.params.id } }).then(function(dbItem) {
      res.render("/userProfile", {
        item: dbItem
      });
    });
  });
};
