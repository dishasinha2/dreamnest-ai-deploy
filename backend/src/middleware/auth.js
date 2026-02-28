import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const h = req.headers.authorization;
  const token = h && h.split(" ")[1];
  if (!token) return res.status(401).json({ error: "token required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "invalid token" });
  }
}
