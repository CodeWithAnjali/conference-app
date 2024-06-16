import { Server, Socket } from "socket.io";
import  {createServer} from "https";
import { randomBytes } from "crypto";
import cors from "cors";
import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import chalk from "chalk";

const app = express();
const httpServer = createServer({
  cert: readFileSync("./certs/cert1.pem"),
  key: readFileSync("./certs/privkey1.pem")
}, app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

type TSocketAndUser = {
  socket: Socket,
  username: string,
};

type TRoomAndUser = {
  username: string,
  uid: string
}

type OnJoinEventData = { uid: string, username: string };

const userToSocketMapping = new Map<string, TSocketAndUser>();
const adminAndRoomID = new Map<string, TRoomAndUser>();

function createRoomID() {
  return randomBytes(16).toString("hex");
}

function printError(...msg: string[]) {
  console.log(chalk.bgRed("Error:"), chalk.red(...msg))
}

function printInfo(...msg: string[]) {
  console.log(chalk.bgRed("Info:"), chalk.yellow(...msg))
}
  
function printSuccess(...msg: string[]) {
  console.log(chalk.bgGreenBright("Success:"), chalk.greenBright(...msg))
}

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/ip-check", (req, res) => {
  res.send({ ipAddress: req.ip, ipAddresses: req.ips })
})

app.post("/create-room", (req: Request, res: Response) => {
  const { uid, username } = req.body;
  const roomId = createRoomID();
  adminAndRoomID.set(roomId, {
    uid,
    username
  });
  res.send({ roomId });
  printSuccess("Room ID Send Success:", JSON.stringify({ uid, username, roomId }));
});

io.on("connection", (socket: Socket) => {
  socket.on("join-room", ({ uid, username }: OnJoinEventData) => {
    userToSocketMapping.set(uid, { socket, username });
  });

  socket.on("call-user", ({ roomId, offer, uid }): void => {
    if (adminAndRoomID.has(roomId)) {
      const creatorID = adminAndRoomID.get(roomId)!;
      if (!userToSocketMapping.has(creatorID.uid)) {
        printError("On-Call-User: Not Found", JSON.stringify({ creatorID, roomId }))
        return;
      }

      const creatorSocket = userToSocketMapping.get(creatorID.uid)!;
      creatorSocket.socket.emit("call-offer", { offer, otherUID: uid });
      printSuccess("On-Call-user: call-offer emitted", JSON.stringify({ otherUID: uid }))
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
    if (!userToSocketMapping.has(otherUID)) {
      printError("On-creator-ice-candidate: User Socket Not Found", JSON.stringify({ otherUID }))
      return;
    }

    const { socket, username } = userToSocketMapping.get(otherUID)!;
    socket.emit("recv-ice-candidate", { candidate: icecandidate });
    printSuccess("On-creator-ice-candidate: Creator Candidate Send", JSON.stringify({ otherUID, username }));
  });
  socket.on("joined-ice-candidate", ({ roomId, icecandidate }): void => {
    if (!adminAndRoomID.has(roomId)) {
      printError("On-join-ice-candidate: can't find admin id with roomid or admin doesn't exists");
    return;
    }
    
    const creatorId = adminAndRoomID.get(roomId)!;
    if (!userToSocketMapping.has(creatorId.uid)) {
      printError("On-join-ice-candidate: can't find admin socket with uid");
      return;
    }
    const { socket } = userToSocketMapping.get(creatorId.uid)!;
    
    socket.emit("recv-ice-candidate", { candidate: icecandidate });
    printSuccess("On-join-ice-candidate: Joined Candidate Send", JSON.stringify({ roomId, creatorId }));
  });
});

httpServer.listen(443, () => {
  console.log("Server is listening on port 443");
});
