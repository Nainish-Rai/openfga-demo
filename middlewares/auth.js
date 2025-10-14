import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authMiddleware = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const [_, token] = authHeader.split("Bearer");
  const decoded = jwt.verify(
    token.trim(),
    process.env.JWT_SECRET || "mysupersecret"
  );

  req.user = decoded;
  return next();
};
