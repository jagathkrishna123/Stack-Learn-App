import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

export const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = await Admin.create({
        name: "System Admin",
        email: "admin@stacklearn.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });
      console.log("==========================================");
      console.log("🔑 Default Admin Created:");
      console.log("📧 Email   : admin@stacklearn.com");
      console.log("🔒 Password: admin123");
      console.log("==========================================");
    }
  } catch (error) {
    console.error("Error seeding default admin:", error);
  }
};
