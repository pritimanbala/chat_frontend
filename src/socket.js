import { io } from "socket.io-client";

const socket = io("https://chatbackend-production-ed04.up.railway.app", {
  autoConnect: false,
});

export default socket;
