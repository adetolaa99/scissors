import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

function connectMongoDB() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in the environment variables");
    process.exit(1);
  }

  mongoose.connect(MONGODB_URI);

  mongoose.connection.on("connected", () => {
    console.log("The App has connected to MongoDB successfully!");
  });

  mongoose.connection.on("error", (err) => {
    console.log(err);
    console.log("An error occurred!");
  });
}

export { connectMongoDB };
