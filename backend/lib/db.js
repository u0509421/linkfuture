// connect to mongo db
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB Connection Error: ", error);
    process.exit(1); // 1 is the exit code for failure, 0 is for success
  }
};
