import { useState } from "react";
import { ReactComponent as CloseIcon } from "../../images/close_20.svg";
import Button from "../Button";
import Modal from "../Modal";
import axios from "../Root/axios";

const DeleteUserModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const deleteUser = async () => {
    await axios.delete("/user", { csrf: true });
    window.location.reload();
  };

  return (
    <>
      <button
        className="absolute bottom-0 left-0 rounded-full bg-blue-600 p-0.5 text-blue-50 hover:bg-red-700 focus:bg-red-700 dark:bg-blue-500 dark:text-dark dark:hover:bg-red-500 dark:focus:bg-red-500"
        onClick={() => setIsOpen(true)}
        aria-label="Delete your account"
      >
        <CloseIcon />
      </button>
      <Modal
        isOpen={isOpen}
        onModalClose={() => setIsOpen(false)}
        title="Delete"
      >
        <p>Your account will be deleted permanently.</p>
        <div className="flex flex-row flex-nowrap gap-x-2">
          <Button
            type="button"
            color="primary"
            width="full"
            text="Cancel"
            onClick={() => setIsOpen(false)}
          />
          <Button
            type="button"
            color="danger"
            width="full"
            text="Delete"
            onClick={deleteUser}
          />
        </div>
      </Modal>
    </>
  );
};

export default DeleteUserModal;
