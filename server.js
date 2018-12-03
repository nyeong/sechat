const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const http = require("http");
const io = require("socket.io");
const bodyParser = require("body-parser");
const logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const createError = require("http-errors");
const expressSanitizer = require("express-sanitizer");

class Server {
  constructor() {
    this.dbUserName = 'sechat';
    this.dbPassword = 'admin1234';
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
    this.host = "0.0.0.0";

    this.app = express();
    this.http = http.createServer(this.app);
    this.io = io(this.http);
  }

  setConfig() {
    this.app.set("views", path.join(__dirname, "app/views"));
    this.app.set("view engine", "ejs");
    this.app.set("layout", "layout");
    this.app.use(expressLayouts);
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(expressSanitizer());
    this.app.use(logger("dev"));
    this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use(
      session({
        rolling: true,
        saveUninitialized: false,
        resave: false,
        secret: "secret-key",
        store: require("mongoose-session")(mongoose)
      })
    );
  }

  includeRoutes() {
    require("./app/sockets")(this.io);
    this.app.use((req, res, next) => {
      res.locals.title = "CSSM";
      res.locals.user = req.session.user;
      next();
    });
    this.app.use("/", require("./app/routers/login"));
    this.app.use("/", require("./app/routers/calendar"));
    this.app.use("/", require("./app/routers/group"));
    this.app.use("/", require("./app/routers/home"));
    this.app.use("/", require("./app/routers/invite"));
    this.app.use((req, res, next) => next(createError(404)));
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
