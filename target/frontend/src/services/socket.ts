import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socket = new SockJS("http://localhost:8080/chat");

export const socketClient = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000,
  debug: (str) => console.log(str),
});
