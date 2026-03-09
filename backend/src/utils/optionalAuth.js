import jwt from "jsonwebtoken";
import User from "../models/User.js";

const optionalAuth = async (request, _response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const payload = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    request.user = await User.findById(payload.userId).select("-passwordHash");
  } catch (_error) {
    request.user = null;
  }

  next();
};

export default optionalAuth;
