import dotenv from "dotenv";

dotenv.config();

import express, { ErrorRequestHandler } from "express";
import session, { SessionOptions, CookieOptions } from "express-session";
import helmet from "helmet";
import env from "./env";
import authRouter from "./routers/auth";
import userRouter from "./routers/user";
import roomsRouter from "./routers/rooms";
import csrfRouter from "./routers/csrf";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import passport from "passport";
import cors from "cors";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
);

const sess: SessionOptions = {
  name: "sId",
  secret: env.SECRET,
  resave: false,
  saveUninitialized: false,
  unset: "destroy",
  cookie: {
    domain: env.CLIENT_DOMAIN,
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  },
  store: new (connectPg(session))({ pool, tableName: "sessions" }),
};

if (env.NODE_ENV === "production") {
  // app.set("trust proxy", 1)
  (sess.cookie as CookieOptions).secure = true;
}

app.use(session(sess));
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as Express.User);
});

app.use("/auth", authRouter);
app.use("/", userRouter);
app.use("/", roomsRouter);
app.use("/", csrfRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(((err, req, res, next) => {
  res.status(500).json({ error: "Internal Server Error" });
}) as ErrorRequestHandler);

app.listen(env.PORT, () => {
  console.log("Server listening on port " + env.PORT);
});
