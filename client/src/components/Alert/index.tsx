import { useEffect, useState } from "react";
import { ReactComponent as CloseIcon } from "../../images/close_24.svg";

interface AlertProps {
  text?: string;
}

const Alert = ({ text }: AlertProps) => {
  const [isOpen, setIsOpen] = useState(Boolean(text));

  useEffect(() => {
    if (!text) return;
    setIsOpen(true);

    const timeout = setTimeout(() => setIsOpen(false), 10000);
    return () => clearTimeout(timeout);
  }, [text]);

  return isOpen ? (
    <div
      role="alert"
      className="absolute top-24 z-20 flex w-full flex-row flex-nowrap items-center bg-red-500 p-1 text-dark shadow-4 md:p-2 lg:m-2 lg:w-[calc(100%-16px)] lg:rounded-lg"
    >
      <p className="w-[calc(100%-24px)] break-words">{text}</p>
      <button onClick={() => setIsOpen(false)}>
        <CloseIcon />
      </button>
    </div>
  ) : null;
};

export default Alert;
