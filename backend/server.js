import dotenv from "dotenv";
import app from "./src/app.js";
import connectDatabase from "./src/utils/connectDatabase.js";
import seedDefaultAdmin from "./src/utils/seedDefaultAdmin.js";
import syncIndexes from "./src/utils/syncIndexes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase(process.env.MONGO_URI);
  await syncIndexes();
  await seedDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
