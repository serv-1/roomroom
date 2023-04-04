import { useState } from "react";
import Button from "../Button";
import Modal from "../Modal";
import { User } from "../Root";
import TextField from "../TextField";
import { ReactComponent as DoneIcon } from "../../images/done_24.svg";
import { ReactComponent as CloseIcon } from "../../images/close_24.svg";
import { ReactComponent as AddIcon } from "../../images/add_24.svg";
import UserImage from "../UserImage";
import axios from "../Root/axios";

type FetchedUser = Omit<User, "email">;

interface InviteModalProps {
  roomId: number;
}

const InviteModal = ({ roomId }: InviteModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState<FetchedUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<FetchedUser[]>([]);

  const fetchUsers: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const value = e.currentTarget.value.trim();

    if (!value) return setFetchedUsers([]);

    const { data } = await axios.get<{ users: FetchedUser[] }>(
      "/invite?roomId=" + roomId + "&name=" + value,
    );

    setFetchedUsers(data.users);
  };

  const selectUser = (user: FetchedUser) => {
    setSelectedUsers((s) => [...s, user]);
  };

  const deselectUser = (user: FetchedUser) => {
    setSelectedUsers((s) => s.filter((u) => u.id !== user.id));
  };

  const inviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    await axios.post("/invite", {
      data: { roomId, userIds: selectedUsers.map(({ id }) => id) },
      csrf: true,
    });

    setSelectedUsers([]);
  };

  return (
    <>
      <Button
        color="primary"
        width="full"
        type="submit"
        text="Invite"
        onClick={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        onModalClose={() => setIsOpen(false)}
        title="Invite"
      >
        {selectedUsers.length ? (
          <ul className="max-h-40 overflow-y-auto">
            {selectedUsers.map((user) => (
              <li
                key={user.id}
                className="mb-2 flex flex-row flex-nowrap items-center gap-x-2 last:mb-0"
              >
                <UserImage name={user.name} image={user.image} size={40} />
                <span className="truncate">{user.name}</span>
                <button
                  onClick={() => deselectUser(user)}
                  className="ml-auto shrink-0 text-red-700 dark:text-red-500"
                  aria-label={"Deselect " + user.name}
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <span role="status">Users to invite will display here.</span>
        )}
        <TextField type="text" name="name" label="Name" onChange={fetchUsers} />
        <ul className="max-h-40 overflow-y-auto">
          {fetchedUsers.map((user) => (
            <li
              key={user.id}
              className="mb-2 flex flex-row flex-nowrap items-center gap-x-2 last:mb-0"
            >
              <UserImage name={user.name} image={user.image} size={40} />
              <span className="truncate">{user.name}</span>
              {selectedUsers.includes(user) ? (
                <DoneIcon className="ml-auto shrink-0" />
              ) : (
                <button
                  onClick={() => selectUser(user)}
                  className="ml-auto shrink-0 text-blue-600 dark:text-blue-500"
                  aria-label={"Select " + user.name}
                >
                  <AddIcon />
                </button>
              )}
            </li>
          ))}
        </ul>
        <Button
          color="primary"
          width="full"
          type="button"
          text="Invite"
          onClick={inviteUsers}
        />
      </Modal>
    </>
  );
};

export default InviteModal;
