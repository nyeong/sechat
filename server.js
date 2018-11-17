const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const http = require("http");
const socketio = require("socket.io");
const bodyParser = require("body-parser");
const logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const createError = require("http-errors");

class Server {
  constructor() {
    this.dbUserName = process.env.DB_USERNAME;
    this.dbPassword = process.env.DB_PASSWORD;
    this.dbURL = `mongodb://${this.dbUserName}:${
      this.dbPassword
    }@ds039768.mlab.com:39768/sechat`;
    mongoose.connect(
      this.dbURL,
      {
        useNewUrlParser: true
      }
    );
    this.db = mongoose.connection;
    this.db.once("open", () => {
      console.log("Connected to mongodb server");
    });
    this.port = process.env.PORT || 4000;
    this.host = "localhost";

    this.app = express();
    this.http = http.createServer(this.app);
    this.socket = socketio(this.http);
  }

  setConfig() {
    this.app.set("views", path.join(__dirname, "app/views"));
    this.app.set("view engine", "ejs");
    this.app.set("layout", "layout");
    this.app.use(expressLayouts);
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(logger("dev"));
    this.app.use(express.static(path.join(__dirname, "public")));

    this.app.use(
      session({
        saveUninitialized: false,
        resave: false,
        secret: "secret-key",
        store: require("mongoose-session")(mongoose),
        setTimeout: 60 * 60 * 1000
      })
    );
  }

  includeRoutes() {
    this.app.use("/", require("./app/routes/sessions"));
    this.app.use("/", require("./app/routes/home"));
    this.app.use("/groups", require("./app/routes/groups"));
    this.app.use((req, res, next) => next(createError(404)));
    this.app.use((req, res, next) => {
      res.locals.title = "CSSM";
      next();
    });
    this.app.use((err, req, res, next) => {
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};
      res.status(err.status || 500);
      res.render("error");
    });
  }

  run() {
    this.setConfig();
    this.includeRoutes();

    this.http.listen(this.port, this.host, () => {
      console.log(`Listening on http://${this.host}:${this.port}`);
    });
  }
}

const app = new Server();
app.run();
