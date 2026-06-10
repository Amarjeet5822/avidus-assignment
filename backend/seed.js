import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/user.models.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for seeding...");
    const adminEmail = "example@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash("admin", Number(process.env.SALT_ROUNDS));

    if (existingAdmin) {
      console.log("Admin user already exists. Updating details...");
      await User.findByIdAndUpdate(existingAdmin._id, {
        first_name: "Amarjeet",
        last_name: "Gupta",
        username: "amar_gupta",
        password: hashedPassword,
        role: "Admin",
      });
      console.log("Admin user updated successfully.");
    } else {
      const newAdmin = new User({
        first_name: "Amarjeet",
        last_name: "Gupta",
        username: "amar_gupta",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin",
      });
      await newAdmin.save();
      console.log("Admin user seeded successfully.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
