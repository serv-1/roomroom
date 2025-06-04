import express from "express";
import Mailjet from "node-mailjet";
import env from "../env";
import passport from "passport";
import MagicLoginStrategy from "passport-magic-login";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { string, ValidationError } from "yup";
import db from "../db";
import type { DatabaseError } from "pg";
import methods from "../middlewares/methods";
import forbidSessionUser from "../middlewares/forbidSessionUser";
import forbidAnonymUser from "../middlewares/forbidAnonymUser";
import signOut from "../middlewares/signOut";

const mj = Mailjet.apiConnect(env.MAILJET_KEY, env.MAILJET_SECRET);

const magicLogin = new MagicLoginStrategy({
  secret: env.SECRET,
  callbackUrl: "/auth/email/callback",
  sendMagicLink: async (destination, href) => {
    const url = env.SERVER_URL + href;

    await mj.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: env.MAILJET_SENDER,
            Name: "RoomRoom",
          },
          To: [{ Email: destination }],
          Subject: "Sign in Link",
          HTMLPart: `
						<h1>Welcome</h1>
						<p>Please click on the link below to sign in:</p>
						<a href="${url}">Sign in</a>
					`,
        },
      ],
    });
  },
  verify: async (payload, cb) => {
    const email = payload.destination as string;

    try {
      let result = await db.query<{ id: string }>(
        `SELECT * FROM users WHERE email=$1`,
        [email],
      );

      if (result.rows.length === 0) {
        const name =
          (email.split("@")[0] as string) + Math.round(Math.random() * 1000);

        result = await db.query<{ id: string }>(
          `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id`,
          [name, email],
        );
      }

      cb(null, result.rows[0]);
    } catch (e) {
      cb(e as DatabaseError);
    }
  },
});

const google = new GoogleStrategy(
  {
    clientID: env.GOOGLE_ID,
    clientSecret: env.GOOGLE_SECRET,
    callbackURL: env.SERVER_URL + "/auth/google/callback",
    scope: ["email"],
  },
  async (accessToken, refreshToken, profile, cb) => {
    const email = profile._json.email as string;

    try {
      let result = await db.query<{ id: number }>(
        `SELECT id FROM users WHERE email=$1`,
        [email],
      );

      if (result.rows.length === 0) {
        const name =
          (email.split("@")[0] as string) + Math.round(Math.random() * 1000);

        result = await db.query<{ id: number }>(
          `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id`,
          [name, email],
        );
      }

      cb(null, result.rows[0]);
    } catch (e) {
      cb(e as DatabaseError);
    }
  },
);

passport.use(magicLogin);
passport.use(google);

const router = express.Router();

router.use(express.json());

router.all(
  "/email",
  methods(["POST"]),
  forbidSessionUser,
  async (req, res, next) => {
    try {
      await emailSchema.validate(req.body.destination);
    } catch (e) {
      res.status(422).json({ error: (e as ValidationError).message });
      return;
    }

    next();
  },
  magicLogin.send,
);

router.all(
  "/email/callback",
  methods(["GET"]),
  forbidSessionUser,
  passport.authenticate("magiclogin", {
    successRedirect: env.CLIENT_URL,
    failureRedirect: env.CLIENT_URL,
  }),
);

router.all("/sign-out", methods(["DELETE"]), forbidAnonymUser, signOut);

router.all(
  "/google",
  methods(["GET"]),
  forbidSessionUser,
  passport.authenticate("google"),
);

router.all(
  "/google/callback",
  methods(["GET"]),
  forbidSessionUser,
  passport.authenticate("google", {
    successRedirect: env.CLIENT_URL,
    failureRedirect: env.CLIENT_URL,
  }),
);

export default router;

export const emailSchema = string()
  .trim()
  .required("An email address is expected.")
  .email("This email address is invalid.")
  .typeError("This email address is invalid.");
