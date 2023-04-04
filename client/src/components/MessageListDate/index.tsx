interface MessageListDateProps {
  date: Date;
}

const MessageListDate = ({ date }: MessageListDateProps) => {
  const now = new Date();

  const isNowYear = date.getFullYear() === now.getFullYear();
  const isNowMonth = date.getMonth() === now.getMonth();
  const isNowDate = date.getDate() === now.getDate();

  return (
    <div className="m-auto my-4 rounded-full bg-blue-100 py-2 px-3 text-sm dark:bg-dark-1 dark:text-blue-50">
      {date.toLocaleDateString("en-US", {
        weekday: "long",
        year: isNowYear ? undefined : "numeric",
        month: isNowYear && isNowMonth ? undefined : "long",
        day: isNowYear && isNowMonth && isNowDate ? undefined : "numeric",
      })}
    </div>
  );
};

export default MessageListDate;
