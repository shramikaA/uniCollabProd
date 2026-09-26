const { collabSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Collab = require("./models/unicollab");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first");
    return res.redirect("/login");
  } else {
    next();
  }
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateCollab = (req, res, next) => {
  const { err } = collabSchema.validate(req.body);
  if (err) {
    const msg = err.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const collab = await Collab.findById(id);
  if (!collab.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/collab/${id}`);
  }
  next();
};
