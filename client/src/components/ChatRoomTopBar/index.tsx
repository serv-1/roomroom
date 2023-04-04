import OnlineMemberListModal from "../OnlineMemberListModal";
import { Room } from "../ChatRoomPage/loader";
import MemberListModal from "../MemberListModal";
import TopBarMenu from "../TopBarMenu";

interface ChatRoomTopBarProps {
  subject: string;
  creatorId: number;
  roomId: number;
  userId: number;
  scope: Room["scope"];
  memberIds: number[];
}

const ChatRoomTopBar = ({
  subject,
  roomId,
  userId,
  scope,
  memberIds,
  creatorId,
}: ChatRoomTopBarProps) => {
  return (
    <div className="flex flex-col md:flex-col-reverse lg:border-r-2 lg:border-b-2 lg:border-blue-600 lg:dark:border-blue-500">
      <div className="flex w-full flex-row flex-nowrap items-center bg-blue-600 shadow-3 dark:bg-dark-3 md:bg-blue-50 md:p-4 md:pt-2 md:shadow-2 md:dark:bg-dark-2 lg:shadow-none lg:dark:bg-dark">
        <TopBarMenu />
        <MemberListModal
          roomSubject={subject}
          userId={userId}
          creatorId={creatorId}
          memberIds={memberIds}
          isRoomPrivate={scope === "private"}
        />
        <OnlineMemberListModal
          roomSubject={subject}
          roomId={roomId}
          userId={userId}
          creatorId={creatorId}
          isRoomPrivate={scope === "private"}
        />
      </div>
      <div className="break-words p-2 shadow-2 dark:bg-dark-2 dark:text-blue-50 md:p-4 md:pb-0 md:text-5 md:shadow-none lg:dark:bg-dark">
        {subject}
      </div>
    </div>
  );
};

export default ChatRoomTopBar;
