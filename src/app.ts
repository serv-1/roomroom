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
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: new (connectPg(session))({ pool, tableName: "sessions" }),
};

if (env.NODE_ENV === "production") {
  (sess.cookie as CookieOptions).secure = true;
}

export const sessionParser = session(sess);

app.use(sessionParser);
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as Express.User);
});

app.use("/auth", authRouter);
app.use("/", userRouter);
app.use("/", userRoomsRouter);
app.use("/", roomsRouter);
app.use("/", roomsSearchRouter);
app.use("/", roomsIdRouter);
app.use("/", csrfRouter);
app.use("/", usersIdRouter);
app.use("/", messagesRoomIdRouter);
app.use("/", inviteRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(((err, req, res, next) => {
  res.status(500).json({ error: "Internal Server Error" });
}) as ErrorRequestHandler);

export default app;
