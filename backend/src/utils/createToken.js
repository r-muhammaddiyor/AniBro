import jwt from "jsonwebtoken";

const createToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

export default createToken;
