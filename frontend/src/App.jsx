import { useState } from "react";
import RoomJoin from "./components/RoomJoin";
import Whiteboard from "./components/Whiteboard";
import { useRoom } from "./context/RoomContext";

function App() {
  const { roomId } = useRoom();
  return <div>{roomId ? <Whiteboard /> : <RoomJoin />}</div>;
}

export default App;
