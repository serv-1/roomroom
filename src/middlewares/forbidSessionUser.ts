import type { RequestHandler } from "express";

const forbidSessionUser: RequestHandler = (req, res, next) => {
  if (req.user) {
    res.status(403).json({ error: "You are already signed in." });
    return;
  }

  next();
};

export default forbidSessionUser;
