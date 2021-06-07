const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        console.log(favorite);
        console.log(req.user._id);
        if (favorite) {
          if (
            favorite.user.equals(req.user._id) &&
            favorite.campsites.includes(req.body._id)
          ) {
            res.end("Campsite already favorited by user.");
          } else {
            favorite.campsites.push(req.body);
            favorite.save();
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          }
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then((campsite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(campsite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end("User does not have any favorite campsites to delete.");
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite.campsites.includes(req.params.campsiteId)) {
          res.end("That campsite is already a favorite!");
        } else {
          favorite.campsites.push(req.params.campsiteId);
          favorite.save();
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          favorite.campsites = favorite.campsites.filter(
            (campsite) => campsite != req.params.campsiteId
          );
          favorite.save();
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end("You do not have any favorites to delete");
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
