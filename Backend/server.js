import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";


/* =========================================================
        CONNECT DATABASE
========================================================= */
connectDB();

/* =========================================================
        SEED DEFAULT ADMIN (run once on startup)
========================================================= */
seedAdmin()
  .then(() => {
    console.log("✅ Default admin seeding completed (if needed).");
  })
  .catch((err) => {
    console.error("❌ Error during admin seeding:", err);
  });

/* =========================================================
        START SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
==========================================
🚀 Server is running successfully
🌐 URL  : http://localhost:${PORT}
🌍 Mode : ${process.env.NODE_ENV || "development"}
==========================================
`);
});