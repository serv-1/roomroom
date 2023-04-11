import express, { ErrorRequestHandler } from "express";
import session, { SessionOptions, CookieOptions } from "express-session";
import helmet from "helmet";
import authRouter from "./routers/auth";
import userRouter from "./routers/user";
import userRoomsRouter from "./routers/user/rooms";
import usersIdRouter from "./routers/users/[id]";
import roomsRouter from "./routers/rooms";
import roomsIdRouter from "./routers/rooms/[id]";
import roomsSearchRouter from "./routers/rooms/search";
import messagesRoomIdRouter from "./routers/messages/[roomId]";
import csrfRouter from "./routers/csrf";
import inviteRouter from "./routers/invite";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import passport from "passport";
import cors from "cors";
import env from "./env";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";

const app = express();

const s3Url = `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
const _helmet = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      connectSrc: [s3Url, "'self'", "https://*.giphy.com"],
      imgSrc: [s3Url, "'self'", "data:", "https://*.giphy.com"],
      mediaSrc: [s3Url, "'self'"],
    },
  },
});

const _rateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  legacyHeaders: false,
  standardHeaders: true,
});

const _cors = cors({
  origin: env.CLIENT_URL,
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
});

const sess: SessionOptions = {
  name: "sId",
  secret: env.SECRET,
  resave: false,
  saveUninitialized: false,
  unset: "destroy",
  cookie: {
    domain: env.CLIENT_DOMAIN,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "strict",
  },
  store: new (connectPg(session))({ pool, tableName: "sessions" }),
};

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  (sess.cookie as CookieOptions).secure = true;
}

export const sessionParser = session(sess);

app.use(compression());
app.use(_rateLimit);
app.use(_helmet);
app.use(_cors);
app.use(sessionParser);
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as Express.User);
});

app.use("/api/auth", authRouter);
app.use("/api", userRouter);
app.use("/api", userRoomsRouter);
app.use("/api", roomsRouter);
app.use("/api", roomsSearchRouter);
app.use("/api", roomsIdRouter);
app.use("/api", csrfRouter);
app.use("/api", usersIdRouter);
app.use("/api", messagesRoomIdRouter);
app.use("/api", inviteRouter);

if (env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../client/build")));

  app.get("/*", (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
  });
}

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(((err, req, res, next) => {
  res.status(500).json({ error: "Internal Server Error" });
}) as ErrorRequestHandler);

export default app;
