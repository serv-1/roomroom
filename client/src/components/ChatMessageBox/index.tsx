import { useEffect, useRef, useState } from "react";
import { Room, RoomMessage } from "../ChatRoomPage/loader";
import { GifResult } from "@giphy/js-fetch-api";
import MessageList from "../MessageList";
import { useWebSocket } from "../WebSocketProvider";
import useIntersectionObserver from "./useIntersectionObserver";
import axios from "../Root/axios";
import setMsgGifs from "./setMsgGifs";
import ScrollToBottomButton from "../ScrollToBottomButton";

export type IGif = GifResult["data"];
export type MsgWithGif = Omit<RoomMessage, "gif"> & { gif: IGif | null };
type ScrollBehavior = "smooth" | "auto" | false;
type WSMessage = { event: "message"; data: RoomMessage };

interface ChatMessageBoxProps extends Pick<Room, "messages" | "nbOfUnseenMsg"> {
  userId: number;
  roomId: number;
}

const ChatMessageBox = ({
  messages: lastMessages,
  userId,
  roomId,
  nbOfUnseenMsg,
}: ChatMessageBoxProps) => {
  const [messages, setMessages] = useState<MsgWithGif[]>([]);
  const [scrollBehavior, setScrollBehavior] = useState<ScrollBehavior>("auto");
  const [hasUnseenMsg, setHasUnseenMsg] = useState(Boolean(nbOfUnseenMsg));

  const container = useRef<HTMLDivElement>(null);
  const listStart = useRef<HTMLDivElement>(null);
  const listEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => setMessages(await setMsgGifs(lastMessages)))();
  }, []);

  useEffect(() => {
    if (!messages.length || !scrollBehavior) return;

    container.current?.scrollBy({
      top: container.current.scrollHeight,
      behavior: scrollBehavior,
    });
  }, [scrollBehavior, messages]);

  useIntersectionObserver(
    listStart,
    async ([{ isIntersecting }]) => {
      if (!isIntersecting || messages.length < 15) return;

      const { data } = await axios.get<{ messages: Room["messages"] }>(
        `/messages/${roomId}?msgId=${messages[0].id}`,
        { csrf: true },
      );

      if (!data.messages.length) return;

      const previousMessages = await setMsgGifs(data.messages);

      setMessages((s) => [...previousMessages, ...s]);
      setScrollBehavior(false);

      container.current?.scrollBy(0, container.current.scrollTop + 16);
    },
    { deps: [messages] },
  );

  const { send } = useWebSocket<WSMessage>(async ({ event, data }) => {
    if (event !== "message") return;

    const message = (await setMsgGifs([data]))[0];

    setMessages((s) => [...s, message]);
    setHasUnseenMsg(true);

    const c = container.current as HTMLDivElement;

    setScrollBehavior(
      c.scrollTop + c.clientHeight >= c.scrollHeight ? "smooth" : false,
    );
  });

  useIntersectionObserver(
    listEnd,
    ([{ isIntersecting }]) => {
      if (isIntersecting && hasUnseenMsg && send && messages.length) {
        const msgId = messages[messages.length - 1].id;
        send("seeMessage", { msgId, roomId, userId });
        setHasUnseenMsg(false);
      }
    },
    { deps: [hasUnseenMsg, send, messages] },
  );

  return (
    <div
      ref={container}
      className="scrollbar h-full overflow-y-auto lg:border-r-2 lg:border-blue-600 lg:dark:border-blue-500"
    >
      <div ref={listStart} className="h-4"></div>
      <MessageList messages={messages} userId={userId} />
      <div ref={listEnd} className="h-4"></div>
      <div className="fixed bottom-0 right-1/2 mb-16 translate-x-1/2 md:right-[calc((100%-184px)/2)] md:mb-[72px] lg:right-[calc((100%-248px)/2)]">
        <ScrollToBottomButton
          scrollableElement={container}
          target={listEnd}
          isThereUnseenMsg={hasUnseenMsg}
        />
      </div>
    </div>
  );
};

export default ChatMessageBox;
