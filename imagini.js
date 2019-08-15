const bodyparser = require("body-parser");
const logger = require("./logger");
const express = require("express");
const mysql = require("mysql");
const sharp = require("sharp");
const path = require("path");
const app = express();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: "root",
  password: "pass123",
  database: "microservice"
});

const imageFeature = (req, res, next) => {
  let number = Math.round(Math.random() * 10);
  // use slice ans split to grab last part of url 
  const queryString = splitUrl(req.url);
  console.log('Query string:', queryString);
  let imageName = 'test.png'
  console.log('Number: ', number)
  if (number <= 5) {
    console.log(req.url);
    next();
  }
  else {
    console.log('Bigger than 5')
    console.log(req.url);
    //use split to separate the query string and pass it to the redirect. This will contain the params needed. 
    res.redirect(`/uploads/feature/${queryString}`)
  }
}

const splitUrl = (str) => {
  let newStr = str.split('/');
  return newStr[newStr.length -1];
}

app.db = db;


logger.debug("Connecting to database");
db.connect(err => {
  if (err) {
    logger.error("Connection to database failed")
    throw err;
  }

  console.log('Connected');
  logger.info("Connection to database sucessfull");

  logger.info("Creating table images if does not exists")
  const createTable = () =>
    db.query(
      `CREATE TABLE IF NOT EXISTS images
    (
        id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date_used TIMESTAMP NULL DEFAULT NULL,
        name VARCHAR(300) NOT NULL,
        size INT(11) UNSIGNED NOT NULL,
        data LONGBLOB NOT NULL,

        PRIMARY KEY (id),
        UNIQUE KEY name (name)
    )
    ENGINE=InnoDB DEFAULT CHARSET=utf8`
    );
  createTable();
  
  app.param("image", (req, res, next, image) => {
    if (!image.match(/\.(png|jpg)$/i)) {
      return res.status(403).end();
    }

    db.query("SELECT * FROM images WHERE name = ?", [image], (err, images) => {
      if (err || !images.length) {
        return res.status(404).end();
      }

      req.image = images[0];

      return next();
    });
  });

  app.post(
    "/uploads/:name",
    bodyparser.raw({
      limit: "10mb",
      type: "image/*"
    }),
    (req, res) => {
      db.query(
        "INSERT INTO images SET ?", {
          name: req.params.name,
          size: req.body.length,
          data: req.body
        },
        err => {
          if (err) {
            console.log(err);
            return res.send({
              status: "error",
              code: err.code
            });
          }

          res.send({
            status: "ok",
            size: req.body.length
          });
        }
      );
    }
  );

  app.head("/uploads/:image", (req, res) => {
    return res.status(200).end();
  });

  app.get("/uploads/feature/:image", (req, res) => {
    console.log('In feature');
    if (Object.keys(req.query).length === 0) {
      db.query("UPDATE images SET date_used = UTC_TIMESTAMP WHERE id = ?", [
        req.image.id
      ]);
      res.setHeader(
        "Content-Type",
        "image/" + path.extname(req.image.name).substr(1)
      );
      return res.end(req.image.data);
    }

    let image = sharp(req.image.data);
    let width = +req.query.width;
    let height = +req.query.height;
    let blur = +req.query.blur;
    let sharpen = 5;
    let greyscale = ["y", "yes", "1", "on"].includes(req.query.greyscale);
    let flip = ["y", "yes", "1", "on"].includes(req.query.flip);
    let flop = ["y", "yes", "1", "on"].includes(req.query.flop);

    if (width > 0 && height > 0) {
      image.ignoreAspectRatio();
    }

    if (width > 0 || height > 0) {
      image.resize(width || null, height || null);
    }

    if (flip) image.flip();
    if (flop) image.flop();
    if (blur > 0) image.blur(blur);
    if (sharpen > 0) image.sharpen(sharpen);
    if (greyscale) image.greyscale();

    db.query(
      "UPDATE images " + "SET date_used = UTC_TIMESTAMP " + "WHERE id = ?",
      [req.image.id]
    );

    res.setHeader(
      "Content-Type",
      "image/" + path.extname(req.image.name).substr(1)
    );

    image.pipe(res);


  })

  app.get("/uploads/:image", (req, res) => {
    imageFeature(req, res, () => {
      if (Object.keys(req.query).length === 0) {
        db.query("UPDATE images SET date_used = UTC_TIMESTAMP WHERE id = ?", [
          req.image.id
        ]);
        res.setHeader(
          "Content-Type",
          "image/" + path.extname(req.image.name).substr(1)
        );
        return res.end(req.image.data);
      }
  
      let image = sharp(req.image.data);
      let width = +req.query.width;
      let height = +req.query.height;
      let blur = +req.query.blur;
      let sharpen = +req.query.sharpen;
      let greyscale = ["y", "yes", "1", "on"].includes(req.query.greyscale);
      let flip = ["y", "yes", "1", "on"].includes(req.query.flip);
      let flop = ["y", "yes", "1", "on"].includes(req.query.flop);
  
      if (width > 0 && height > 0) {
        image.ignoreAspectRatio();
      }
  
      if (width > 0 || height > 0) {
        image.resize(width || null, height || null);
      }
  
      if (flip) image.flip();
      if (flop) image.flop();
      if (blur > 0) image.blur(blur);
      if (sharpen > 0) image.sharpen(sharpen);
      if (greyscale) image.greyscale();
  
      db.query(
        "UPDATE images " + "SET date_used = UTC_TIMESTAMP " + "WHERE id = ?",
        [req.image.id]
      );
  
      res.setHeader(
        "Content-Type",
        "image/" + path.extname(req.image.name).substr(1)
      );
  
      image.pipe(res);
    });
    
  });

  app.get("/stats", (req, res) => {
    db.query(
      "SELECT COUNT(*) total, SUM(size) size, MAX(date_created) last_created FROM images",
      (err, rows) => {
        if (err) {
          return res.status(500).end();
        }

        rows[0].uptime = process.uptime();
        return res.send(rows[0]);
      }
    );
  });

  app.delete("/uploads/:image", (req, res) => {
    db.query("DELETE FROM images WHERE id = ?", [req.image.id], err => {
      return res.status(err ? 500 : 200).end();
    });
  });

  app.listen(3000, () => {
    logger.info("Server running")
  });
});

module.exports = app;