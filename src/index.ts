import dotenv from "dotenv";

dotenv.config();

import type { Request, Response } from "express";
import env from "./env";
import { createServer } from "http";
import app, { sessionParser } from "./app";
import wss from "./websocket";

const server = createServer(app);

server.on("upgrade", (request, socket, head) => {
  const req = request as Request;

  sessionParser(req, {} as Response, async () => {
    if (!req.session.passport?.user.id) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, function (ws) {
      wss.emit("connection", ws, req);
    });
  });
});

server.listen(env.PORT, () => {
  console.log("Server listening on port " + env.PORT);
});
