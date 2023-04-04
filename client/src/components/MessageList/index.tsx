import { Fragment } from "react";
import Message from "../Message";
import { MsgWithGif } from "../ChatMessageBox";
import MessageListDate from "../MessageListDate";

interface MessageListProps {
  messages: MsgWithGif[];
  userId: number;
}

const MessageList = ({ messages, userId }: MessageListProps) => {
  const renderedDates: string[] = [];

  return (
    <div className="flex min-h-[calc(100%-32px)] w-full flex-col justify-end gap-y-4 px-2 md:px-4">
      {messages.map((message) => {
        const date = new Date(message.createdAt);
        const dateStr = date.toLocaleDateString("en-US");

        let dateComponent: JSX.Element | null = null;

        if (!renderedDates.includes(dateStr)) {
          renderedDates.push(dateStr);
          dateComponent = <MessageListDate date={date} />;
        }

        return (
          <Fragment key={message.id}>
            {dateComponent}
            <Message
              userId={userId}
              authorId={message.authorId}
              name={message.name}
              image={message.image}
              banned={message.banned}
              createdAt={message.createdAt}
              text={message.text}
              images={message.images}
              videos={message.videos}
              gif={message.gif}
            />
          </Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
