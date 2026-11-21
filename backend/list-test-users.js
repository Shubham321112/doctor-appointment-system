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

    console.log("\nConnected database:", mongoose.connection.name);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      'Type "CONFIRM TEST DB" to list doctors: ',
      async (answer) => {
        try {
          if (answer.trim() !== "CONFIRM TEST DB") {
            console.log("Cancelled.");
            return;
          }

          const users = await User.find({})
            .select("name role specialization rating availability")
            .lean();

          console.table(
            users.map((user) => ({
              name: user.name,
              role: user.role,
              specialization: user.specialization || "NOT SET",
              rating: user.rating ?? "Not available",
              availableDays: user.availability?.length || 0,
            }))
          );
        } catch (error) {
          console.error("Error:", error.message);
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