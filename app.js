if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const path = require("path");
const Collab = require("./models/unicollab"); //importing the DB Schema
//importing Utils
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
//required for authentication
const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const User = require("./models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");

//Routes
const userRoutes = require("./routes/users");
const collabRoutes = require("./routes/collab");

const atlasURL = process.env.DB_URL
// "mongodb://localhost:27017/uni-collab"

//Connecting to our DataBase
mongoose.connect(atlasURL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.on("open", () => {
  console.log("Database Connected");
});

const app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));

//parsing the URL Body
app.use(
  express.urlencoded({
    extended: true,
  })
);

const store = MongoStore.create({
  mongoUrl: atlasURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: 'thisshouldbeabettersecret!'
  }
});

const sessionConfig = {
  store,
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

//cokkies, session and auth related config
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//access flash in our template
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Website Routes
app.use("/", collabRoutes);
app.use("/", userRoutes);

//A bit of Error Handling
app.all("*", (req, res, next) => {
  res.render("fault.ejs");
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "OH NO!!Something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
