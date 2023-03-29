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
          Subject: "Sign in by Email",
          HTMLPart: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>RoomRoom - Sign in by Email</title><style type="text/css">*{margin:0}html{font-family:Arial,sans-serif;font-size:16px;line-height:1.5rem}body{margin:1rem}h1{font-size:2.25rem;line-height:1.5rem;margin-bottom:2rem}h1,p,span{color:#000}a{display:inline-block;letter-spacing:1px;font-weight:700;text-decoration:none;background-color:#2563eb;border-radius:8px;padding:12px;margin:.5rem 0 2rem 0}a span{color:#eff6ff}</style></head><body itemscope itemtype="http://schema.org/EmailMessage"><table><tr><td><h1>Welcome!</h1></td></tr><tr><td><p>Click on the link to sign in.</p></td></p></td></tr><tr><td><a href="${url}"><span>Sign in</span></a></td></tr><tr><td><span>- The RoomRoom Team</span></td></tr></table></body></html>`,
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
    state: true,
  },
  async (accessToken, refreshToken, profile, cb) => {
    type Email = { value: string; verified: "true" | "false" };
    const email = ((profile.emails as Email[])[0] as Email).value;

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
