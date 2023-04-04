import { useState } from "react";
import { RoomMessage } from "../ChatRoomPage/loader";
import classNames from "classnames";
import { useWebSocket } from "../WebSocketProvider";
import { Link } from "react-router-dom";
import UserImage from "../UserImage";
import Linkify from "linkify-react";
import { Gif } from "@giphy/react-components";
import { IGif } from "../ChatMessageBox";
import MessageFilesModal from "../MessageFilesModal";

type Message = { event: "bannedMember"; data: { id: number } };

interface MessageProps extends Omit<RoomMessage, "id" | "gif"> {
  userId: number;
  gif: IGif | null;
}

const Message = ({
  userId,
  authorId,
  name,
  image,
  banned,
  createdAt,
  text,
  images,
  videos,
  gif,
}: MessageProps) => {
  const [isBanned, setIsBanned] = useState(banned);

  useWebSocket<Message>(({ event, data }) => {
    if (event !== "bannedMember" || data.id !== authorId) return;
    setIsBanned(true);
  });

  const isUserAuthor = userId === authorId;

  return (
    <div className="flex flex-row flex-nowrap gap-x-1">
      {!isUserAuthor && (
        <UserImage name={name as string} image={image as string} size={40} />
      )}
      <div
        className={classNames(
          "w-full overflow-hidden",
          isUserAuthor && "text-right",
        )}
      >
        <div className="truncate dark:text-blue-50">
          {isUserAuthor ? (
            "You"
          ) : isBanned ? (
            <span className={isBanned ? "text-red-400 line-through" : ""}>
              {name}
            </span>
          ) : name ? (
            <Link
              to={"/profile/" + authorId}
              className="hover:text-blue-600 dark:hover:text-blue-500"
            >
              {name}
            </Link>
          ) : (
            <span>[DELETED]</span>
          )}
        </div>
        <div
          className={classNames(
            "inline-flex max-w-[258px] flex-col gap-y-2 rounded-lg p-2 md:max-w-[420px]",
            isUserAuthor
              ? "rounded-tr-none bg-blue-600 text-blue-50 dark:bg-blue-500 dark:text-dark"
              : "rounded-tl-none bg-blue-200 dark:bg-blue-300",
            images && "w-full",
          )}
        >
          {text && (
            <p className="whitespace-pre-wrap break-words text-left">
              <Linkify options={{ className: "underline", target: "_blank" }}>
                {text}
              </Linkify>
            </p>
          )}
          {images && <MessageFilesModal keys={images} type="images" />}
          {videos && <MessageFilesModal keys={videos} type="videos" />}
          {gif && (
            <Gif
              gif={gif}
              width={window.innerWidth > 744 ? 404 : 242}
              hideAttribution
              noLink
            />
          )}
        </div>
        <div className="mt-1 text-xs dark:text-blue-50">
          {new Date(createdAt).toLocaleTimeString("en-US", {
            timeStyle: "short",
          })}
        </div>
      </div>
    </div>
  );
};

export default Message;
