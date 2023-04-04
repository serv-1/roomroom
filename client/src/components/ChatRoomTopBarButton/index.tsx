import { ReactComponent as ViewListIcon } from "../../images/view_list_20_fill.svg";

interface ChatRoomTopBarModalButtonProps {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel: string;
}

const ChatRoomTopBarModalButton = ({
  text,
  onClick,
  ariaLabel,
}: ChatRoomTopBarModalButtonProps) => {
  return (
    <button
      type="button"
      className="mr-1 flex flex-row flex-nowrap items-center gap-x-0.5 rounded-[4px] bg-blue-700 px-1 py-0.5 text-sm text-blue-200 shadow-1 dark:bg-blue-500 dark:text-dark md:mr-2 md:bg-blue-600 md:px-2 md:py-1 md:text-blue-50"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <ViewListIcon className="text-blue-400 dark:text-dark md:text-blue-50" />
      {text}
    </button>
  );
};

export default ChatRoomTopBarModalButton;
