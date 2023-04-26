if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URL, {
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected `);
    return mongoose.connection;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const sessionStore = MongoStore.create({
  mongoUrl: process.env.DATABASE_URL,
  collectionName: "sessions",
  autoRemove: "native",
  ttl: 1000 * 60 * 60 * 24,
});

module.exports = { connectDB, mongoose, sessionStore };
