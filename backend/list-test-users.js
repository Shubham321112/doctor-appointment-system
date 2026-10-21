require("dotenv").config();

const mongoose = require("mongoose");
const readline = require("readline");
const User = require("./models/user");

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const dbName = mongoose.connection.name;

    console.log("\nConnected database:", dbName);
    console.log("Before proceeding, confirm this is your TEST database.");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      'Type "CONFIRM TEST DB" to list registered users: ',
      async (answer) => {
        try {
          if (answer.trim() !== "CONFIRM TEST DB") {
            console.log("Cancelled. No user data displayed.");
            return;
          }

          const users = await User.find({})
            .select("name email role")
            .lean();

          if (users.length === 0) {
            console.log("No registered users found.");
          } else {
            console.table(
              users.map(({ name, email, role }) => ({
                name,
                email,
                role,
              }))
            );
          }
        } catch (error) {
          console.error("Could not list users:", error.message);
        } finally {
          rl.close();
          await mongoose.disconnect();
        }
      }
    );
  } catch (error) {
    console.error("Database error:", error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    process.exitCode = 1;
  }
}

main();