import { useState } from "react";
import { ReactComponent as ReportIcon } from "../../images/report_20.svg";
import Button from "../Button";
import Modal from "../Modal";
import { useWebSocket } from "../WebSocketProvider";

interface BanConfirmationModalProps {
  userId: number;
  userName: string;
  roomSubject: string;
}

const BanConfirmationModal = ({
  userId,
  userName,
  roomSubject,
}: BanConfirmationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { send } = useWebSocket();

  const closeModal = () => setIsOpen(false);
  const banMember = () => {
    if (send) send("banMember", { id: userId });
  };

  return (
    <>
      <button aria-label={"Ban " + userName} onClick={() => setIsOpen(true)}>
        <ReportIcon className="text-red-700 dark:text-red-500" />
      </button>
      <Modal onModalClose={closeModal} isOpen={isOpen} title="Ban Confirmation">
        <p>
          {userName} will be banned from “{roomSubject}” permanently. Be sure of
          what you are doing because there is no way to unban a user.
        </p>
        <div className="flex flex-row flex-nowrap gap-x-2">
          <Button
            color="primary"
            type="button"
            width="full"
            onClick={closeModal}
            text="Cancel"
          />
          <Button
            color="danger"
            type="button"
            width="full"
            onClick={banMember}
            text="Ban"
          />
        </div>
      </Modal>
    </>
  );
};

export default BanConfirmationModal;
