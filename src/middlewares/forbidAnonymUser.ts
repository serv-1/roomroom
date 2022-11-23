import type { RequestHandler } from "express";

const forbidAnonymUser: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "You need to be signed in." });
    return;
  }

  next();
};

export default forbidAnonymUser;
