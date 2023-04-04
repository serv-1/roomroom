import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRoom } from "../ProfilePage/loader";
import { useWebSocket } from "../WebSocketProvider";
import { ReactComponent as PublicIcon } from "../../images/public_20.svg";
import { ReactComponent as GroupIcon } from "../../images/group_20.svg";
import { ReactComponent as UpdateIcon } from "../../images/update_20.svg";
import classNames from "classnames";

type Message = {
  event: "onlineMembers";
  data: { ids: number[]; roomId: number };
};

interface ChatRoomProps {
  id: UserRoom["id"];
  subject: UserRoom["subject"];
  scope?: UserRoom["scope"];
  updatedAt: UserRoom["updatedAt"];
  isExpanded?: boolean;
  nbOfUnseenMsg?: UserRoom["nbOfUnseenMsg"];
}

const ChatRoom = ({
  id,
  subject,
  scope,
  updatedAt,
  isExpanded,
  nbOfUnseenMsg,
}: ChatRoomProps) => {
  const [nbOnline, setNbOnline] = useState(0);

  const { send } = useWebSocket<Message>(({ event, data }) => {
    if (event !== "onlineMembers" || data.roomId !== id) return;
    setNbOnline(data.ids.length);
  });

  useEffect(() => {
    if (!send) return;
    send("onlineMembers", { roomId: id });
  }, [send]);

  return (
    <Link
      to={"/rooms/" + id}
      className={classNames(
        "relative block p-1 hover:bg-blue-100 dark:text-blue-50 dark:hover:bg-dark-2 md:p-2",
        isExpanded
          ? "rounded-t-lg bg-blue-200 dark:bg-dark-2"
          : "rounded-lg bg-blue-50 shadow-1 dark:bg-dark-1",
      )}
    >
      <div className="md:mb-1">{subject}</div>
      <div className="flex flex-row flex-nowrap justify-between text-sm">
        {scope && (
          <div className="flex flex-row flex-nowrap items-center gap-x-[2px]">
            <PublicIcon className="text-blue-400" />
            {scope[0].toUpperCase() + scope.slice(1)}
          </div>
        )}
        <div className="flex flex-row flex-nowrap items-center gap-x-[2px]">
          <GroupIcon className="text-blue-400" />
          {nbOnline} online
        </div>
        <div className="flex flex-row flex-nowrap items-center gap-x-[2px]">
          <UpdateIcon className="text-blue-400" />
          {new Date(updatedAt).toLocaleDateString("fr-FR")}
        </div>
      </div>
      {nbOfUnseenMsg && nbOfUnseenMsg !== 0 ? (
        <div
          className="absolute -top-1 -right-1 min-w-[24px] rounded-full bg-blue-400 p-0.5 text-center text-sm text-dark"
          title={
            nbOfUnseenMsg + " new message" + (nbOfUnseenMsg > 1 ? "s" : "")
          }
        >
          +{nbOfUnseenMsg}
        </div>
      ) : null}
    </Link>
  );
};

export default ChatRoom;
