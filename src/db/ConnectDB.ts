import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

if (!process.env.MONGO_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

export const ConnectDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URI || "")
      .then(() => console.log("Database is connected"));

    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from DB");
    });
  } catch (error: any) {
    console.log(`Error while connecting to database: ${error.message}`);
    process.exit(1);
  }
};
