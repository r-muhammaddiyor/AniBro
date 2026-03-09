import bcrypt from "bcryptjs";
import User from "../models/User.js";

const seedDefaultAdmin = async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ email });

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    username: "admin",
    email,
    passwordHash,
    role: "admin"
  });

  console.log(`Seeded default admin: ${email}`);
};

export default seedDefaultAdmin;
