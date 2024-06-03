import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer);


io.on("connection", (socket) => {
    console.log(socket.id);

})

io.on("disconnect", (socket) => {
    console.log(socket.id)
})


httpServer.listen(3200, () => {
    console.log("Server is listening on port 3000");
})
