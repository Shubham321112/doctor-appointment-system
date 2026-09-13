const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);

    if (error.reason) {
      console.error("Error Reason:", error.reason);
    }

    process.exit(1);
  }
};

module.exports = connectDB;