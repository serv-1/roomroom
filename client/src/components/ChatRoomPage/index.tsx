import { useLoaderData, useNavigate } from "react-router-dom";
import { useRootContext } from "../Root";
import { Room } from "./loader";
import ChatRoomTopBar from "../ChatRoomTopBar";
import { useWebSocket } from "../WebSocketProvider";
import { useEffect, useState } from "react";
import useHtmlTitle from "../ProfilePage/useHtmlTitle";
import ChatRoomSendBar from "../ChatRoomSendBar";
import ChatMessageBox from "../ChatMessageBox";

type Message =
  | { event: "bannedMember"; data: { id: number } }
  | { event: "member"; data: { id: number } };

const ChatRoomPage = () => {
  const { room } = useLoaderData() as { room: Room };
  const { user } = useRootContext();
  const navigate = useNavigate();

  const [isMember, setIsMember] = useState(room.memberIds.includes(user.id));

  const { send } = useWebSocket<Message>(({ event, data }) => {
    if (event === "bannedMember" && data.id === user.id) {
      navigate("/");
    } else if (event === "member" && data.id === user.id) {
      setIsMember(true);
    }
  });

  useHtmlTitle(room.subject + " - RoomRoom");

  useEffect(() => {
    if (!send || !isMember) return;

    send("onlineMember", { roomId: room.id, userId: user.id });

    const offlineMember = () => {
      send("offlineMember", { roomId: room.id, userId: user.id });
    };

    window.addEventListener("beforeunload", offlineMember);

    return () => {
      offlineMember();
      window.removeEventListener("beforeunload", offlineMember);
    };
  }, [send, isMember]);

  return (
    <div className="relative flex h-screen flex-col md:h-[calc(100vh-56px)] lg:col-start-3 lg:row-start-2 lg:h-[calc(100vh-58px)]">
      <ChatRoomTopBar
        userId={user.id}
        roomId={room.id}
        scope={room.scope}
        subject={room.subject}
        creatorId={room.creatorId}
        memberIds={room.memberIds}
      />
      <ChatMessageBox
        messages={room.messages}
        userId={user.id}
        roomId={room.id}
        nbOfUnseenMsg={room.nbOfUnseenMsg}
      />
      <ChatRoomSendBar roomId={room.id} />
    </div>
  );
};

export default ChatRoomPage;
