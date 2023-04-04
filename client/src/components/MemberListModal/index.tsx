import { useState } from "react";
import ChatRoomTopBarModalButton from "../ChatRoomTopBarButton";
import MemberList from "../MemberList";
import Modal from "../Modal";
import { useWebSocket } from "../WebSocketProvider";

type Message =
  | { event: "bannedMember"; data: { id: number } }
  | { event: "member"; data: { id: number } };

interface MemberListModalProps {
  userId: number;
  creatorId: number;
  roomSubject: string;
  memberIds: number[];
  isRoomPrivate: boolean;
}

const MemberListModal = ({
  userId,
  creatorId,
  roomSubject,
  isRoomPrivate,
  memberIds: defaultMemberIds,
}: MemberListModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [memberIds, setMemberIds] = useState<number[]>(defaultMemberIds);

  useWebSocket<Message>(({ event, data }) => {
    if (event === "bannedMember") {
      setMemberIds((s) => s.filter((id) => id !== data.id));
    } else if (event === "member") {
      setMemberIds((s) => [...s, data.id]);
    }
  });

  return (
    <>
      <ChatRoomTopBarModalButton
        text={
          memberIds.length + " member" + (memberIds.length !== 1 ? "s" : "")
        }
        onClick={() => setIsOpen(true)}
        ariaLabel="Open the member list"
      />
      <Modal
        isOpen={isOpen}
        onModalClose={() => setIsOpen(false)}
        title="Members"
      >
        <MemberList
          memberIds={memberIds}
          userId={userId}
          creatorId={creatorId}
          roomSubject={roomSubject}
          isRoomPrivate={isRoomPrivate}
        />
      </Modal>
    </>
  );
};

export default MemberListModal;
