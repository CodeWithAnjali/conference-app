import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();

type SocketUserData = {username: string, socket: Socket};

type OnJoinData = {
    username: string,
    uid: string
}

const nsUserMapping = new Map<string, Map<string, SocketUserData>>(); 

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

const callRooms = io.of(/[A-Za-z0-9]*/);

callRooms.on("connection", (socket) => {
    const nspName = socket.nsp.name.slice(1);
    console.log({ namespace: nspName, userid: socket.id });

    if (!nsUserMapping.has(nspName)) 
        nsUserMapping.set(nspName, new Map());

    socket.broadcast.emit("on-join", { socketId: socket.id })

    socket.on("exchange-user-details", ({username}) => {
        socket.broadcast.emit("recv-user-details", {username});
    })


    socket.on("call-user", ({ offer }) => {
        console.log("Call Offer", offer)
        socket.broadcast.emit("call-offer", { offer });
    })

    socket.on("answer-user", ({ answer }) => {
        console.log("Answer-user", answer )
        socket.broadcast.emit("on-answer", { answer });
    })

    socket.on("send-ice-candidate", ({ candidate }) => {
        console.log("Send Ice Candidate", candidate)
        socket.broadcast.emit("ice-candidate", { candidate })
    })
});

io.on("connection", (socket) => {
    console.log(socket.id);
})

io.on("disconnect", (socket) => {
    console.log(socket.id)
})


httpServer.listen(3200, () => {
    console.log("Server is listening on port 3000");
})
