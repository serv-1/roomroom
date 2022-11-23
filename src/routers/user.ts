import express from "express";
import db from "../db";
import methods from "../middlewares/methods";

const router = express.Router();

router.use(express.json());

router.all("/user", methods(["GET"]), async (req, res, next) => {
  const result = await db.query("SELECT * FROM users WHERE id=$1", [
    req.user?.id,
  ]);

  res.status(200).json(result.rows[0]);
});

export default router;
