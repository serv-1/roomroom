import { useEffect, useState } from "react";
import { useWebSocket } from "../WebSocketProvider";
import ChatRoomTopBarModalButton from "../ChatRoomTopBarButton";
import Modal from "../Modal";
import MemberList from "../MemberList";

type Message =
  | { event: "onlineMember"; data: { id: number } }
  | { event: "offlineMember"; data: { id: number } }
  | { event: "onlineMembers"; data: { ids: number[]; roomId: number } }
  | { event: "bannedMember"; data: { id: number } };

interface OnlineMemberListModalProps {
  roomId: number;
  userId: number;
  creatorId: number;
  roomSubject: string;
  isRoomPrivate: boolean;
}

const OnlineMemberListModal = ({
  roomId,
  userId,
  creatorId,
  roomSubject,
  isRoomPrivate,
}: OnlineMemberListModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onlineMemberIds, setOnlineMemberIds] = useState<number[]>([]);

  const { send } = useWebSocket<Message>(({ event, data }) => {
    switch (event) {
      case "onlineMember":
        setOnlineMemberIds((s) => [...s, data.id]);
        break;
      case "onlineMembers":
        setOnlineMemberIds(data.ids);
        break;
      case "offlineMember":
      case "bannedMember":
        setOnlineMemberIds((s) => s.filter((id) => id !== data.id));
    }
  });

  useEffect(() => {
    if (!send) return;
    send("onlineMembers", { roomId });
  }, [send]);

  return (
    <>
      <ChatRoomTopBarModalButton
        text={onlineMemberIds.length + " online"}
        onClick={() => setIsOpen(true)}
        ariaLabel="Open the online member list"
      />
      <Modal
        isOpen={isOpen}
        onModalClose={() => setIsOpen(false)}
        title="Online Members"
      >
        <MemberList
          userId={userId}
          creatorId={creatorId}
          roomSubject={roomSubject}
          memberIds={onlineMemberIds}
          isRoomPrivate={isRoomPrivate}
        />
      </Modal>
    </>
  );
};

export default OnlineMemberListModal;
