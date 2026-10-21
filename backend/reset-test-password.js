
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("./models/user");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected database:", mongoose.connection.name);

    rl.question("Enter your patient email: ", async (email) => {
      try {
        const user = await User.findOne({
          email: email.trim().toLowerCase(),
          role: "patient",
        });

        if (!user) {
          console.log("Patient account not found.");
          return;
        }

        rl.question("Enter a NEW test password: ", async (password) => {
          try {
            if (!password || password.length < 6) {
              console.log("Password must be at least 6 characters.");
              return;
            }

            user.password = await bcrypt.hash(password, 10);
            await user.save();

            console.log("Password reset successful for:", user.email);
          } catch (error) {
            console.error("Reset failed:", error.message);
          } finally {
            rl.close();
            await mongoose.disconnect();
          }
        });
      } catch (error) {
        console.error("Lookup failed:", error.message);
        rl.close();
        await mongoose.disconnect();
      }
    });
  } catch (error) {
    console.error("Database error:", error.message);
    rl.close();
    process.exitCode = 1;
  }
}

main();
