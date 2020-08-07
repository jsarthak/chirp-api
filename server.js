// Import the modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");

// import routes
const users = require("./routes/api/users");
const statuses = require("./routes/api/statuses");

// Initialize express
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => {
    console.log(err);
  });

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport.js")(passport);

// Use routes
app.use("/api/statuses", statuses);
app.use("/api/users", users);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
