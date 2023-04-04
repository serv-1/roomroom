import { MsgWithGif } from ".";
import giphy from "../../giphy";
import { RoomMessage } from "../ChatRoomPage/loader";

const setMsgGifs = async (messages: RoomMessage[]) => {
  const messagesWithGif: MsgWithGif[] = [];

  for (const msg of messages) {
    messagesWithGif.push({
      ...msg,
      gif: msg.gif ? (await giphy.gif(msg.gif)).data : null,
    });
  }

  return messagesWithGif;
};

export default setMsgGifs;
