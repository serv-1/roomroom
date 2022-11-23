import type { RequestHandler } from "express";

const methods =
  (methods: string[]): RequestHandler =>
  (req, res, next) => {
    if (!methods.includes(req.method)) {
      res.status(405).json({ error: "This method is not allowed." });
      return;
    }

    next();
  };

export default methods;
