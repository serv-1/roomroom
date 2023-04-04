import { useActionData, useLoaderData } from "react-router-dom";
import DeleteUserModal from "../DeleteUserModal";
import Room from "../Room";
import { User } from "../Root";
import UpdateUserModal from "../UpdateUserModal";
import UserImage from "../UserImage";
import { UniquenessError } from "./action";
import { UserRoom } from "./loader";
import useHtmlTitle from "./useHtmlTitle";

const ProfilePage = () => {
  const error = useActionData() as Required<UniquenessError> | undefined;

  const { user, rooms } = useLoaderData() as {
    user: User | Omit<User, "email">;
    rooms: UserRoom[];
  };

  const isSessionUser = "email" in user;

  useHtmlTitle(
    (isSessionUser ? "Profile" : user.name + "'s profile") + " - RoomRoom",
  );

  return (
    <div className="scrollbar overflow-y-auto p-4 pt-14 md:pt-4 lg:col-start-3 lg:row-start-2 lg:border-r-2 lg:border-blue-600 lg:dark:border-blue-500">
      <div className="mb-4 flex flex-col items-center gap-y-2">
        {isSessionUser ? (
          <div className="relative">
            <UserImage name={user.name} image={user.image} size={76} />
            <UpdateUserModal user={user} error={error} />
            <DeleteUserModal />
          </div>
        ) : (
          <UserImage name={user.name} image={user.image} size={76} />
        )}
        <div className="text-5 dark:text-blue-50">{user.name}</div>
        {isSessionUser && <div className="dark:text-blue-50">{user.email}</div>}
      </div>
      <section>
        <h2 className="mb-2 text-center text-4 dark:text-blue-50">Seen in</h2>
        {rooms.length ? (
          <ul className="m-auto flex max-w-[432px] flex-col gap-y-2 md:gap-y-3">
            {rooms.map((room) => (
              <li key={room.id}>
                <Room
                  id={room.id}
                  subject={room.subject}
                  scope={room.scope}
                  updatedAt={room.updatedAt}
                  nbOfUnseenMsg={room.nbOfUnseenMsg}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div>No Chat Rooms</div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
