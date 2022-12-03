import type { RequestHandler } from "express";

const signOut: RequestHandler = (req, res, next) => {
  req.logOut((err) => {
    if (err) next(err);

    req.session.destroy((err) => {
      if (err) next(err);

      res.clearCookie("sId");

      res.status(204).end();
    });
  });
};

export default signOut;
