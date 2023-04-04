import { useEffect, useState } from "react";
import Button from "../Button";
import { Room } from "../ChatRoomPage/loader";
import Modal from "../Modal";
import axios from "../Root/axios";

interface DeleteRoomModalProps {
  id: Room["id"];
  subject: Room["subject"];
  setIsDeleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteRoomModal = ({
  id,
  subject,
  setIsDeleted,
}: DeleteRoomModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (!toDelete) return;

    const deleteRoom = async () => {
      await axios.delete("/rooms/" + id, { csrf: true });
      setIsDeleted(true);
    };

    deleteRoom();
  }, [toDelete]);

  return (
    <>
      <Button
        color="danger"
        width="full"
        type="button"
        text="Delete"
        onClick={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        onModalClose={() => setIsOpen(false)}
        title="Delete"
      >
        <p>Your about to delete the Chat Room: “{subject}”.</p>
        <p>
          All the messages and the Chat Room itself will be deleted permanently.
        </p>
        <p>
          Be sure of what you are doing because there is no way to restore them.
        </p>
        <div className="flex flex-row flex-nowrap gap-x-2">
          <Button
            color="primary"
            width="full"
            type="button"
            text="Cancel"
            onClick={() => setIsOpen(false)}
          />
          <Button
            color="danger"
            width="full"
            type="button"
            text="Delete"
            onClick={() => setToDelete(true)}
          />
        </div>
      </Modal>
    </>
  );
};

export default DeleteRoomModal;
