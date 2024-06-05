import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { randomBytes } from "crypto";
import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

type TSocketAndUser = {
  socket: Socket,
  username: string,
};

type OnJoinEventData = { uid: string, username: string };

const userToSocketMapping = new Map<string, TSocketAndUser>();
const adminAndRoomID = new Map<string, string>();

function createRoomID() {
  return randomBytes(16).toString("hex");
}

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/create-room", (req: Request, res: Response) => {
  const { uid } = req.body;
  const roomId = createRoomID();
  adminAndRoomID.set(roomId, uid);
  res.send({ roomId });
});

io.on("connection", (socket: Socket) => {
  socket.on("join-room", ({ uid, username }: OnJoinEventData) => {
    userToSocketMapping.set(uid, { socket, username });
  });

  socket.on("call-user", ({ roomId, offer, uid }) => {
    if (adminAndRoomID.has(roomId)) {
      const creatorID = adminAndRoomID.get(roomId)!;
      if (!userToSocketMapping.has(creatorID)) return;

      const creatorSocket = userToSocketMapping.get(creatorID)!;
      creatorSocket.socket.emit("call-offer", { offer, otherUID: uid });
    } else {
      socket.emit("error-calling", { message: "Can't Find User or something went wrong." });
    }
  });

  socket.on("answer-call", ({ otherUID, answer }) => {
    if (userToSocketMapping.has(otherUID)) {
      const otherSocket = userToSocketMapping.get(otherUID)!;
      otherSocket.socket.emit("on-answer", { answer });
    }
  });

  socket.on("creator-ice-candidate", ({ otherUID, icecandidate }) => {
    console.log({ otherUID, icecandidate })
    if (userToSocketMapping.has(otherUID)) {
      const { socket } = userToSocketMapping.get(otherUID)!;
      socket.emit("recv-ice-candidate", { candidate: icecandidate });
    }
  });

  socket.on("joined-ice-candidate", ({ roomId, icecandidate }) => {
    console.log({ roomId, icecandidate });
    if (!adminAndRoomID.has(roomId)) return;
    const creatorId = adminAndRoomID.get(roomId)!;
    if (!userToSocketMapping.has(creatorId)) return;
    const { socket } = userToSocketMapping.get(creatorId)!;
    socket.emit("recv-ice-candidate", { candidate: icecandidate });
  });
});

httpServer.listen(3200, () => {
  console.log("Server is listening on port 3200");
});
