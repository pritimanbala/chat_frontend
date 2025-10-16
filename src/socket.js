import { io } from "socket.io-client";

//connect to the particular socket
const socket = io("http://localhost:3000", { autoConnect: false });

export default socket;
