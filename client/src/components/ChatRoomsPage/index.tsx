import { useLoaderData } from "react-router-dom";
import ExpandableRoom from "../ExpandableRoom";
import { UserRoom } from "../ProfilePage/loader";
import useHtmlTitle from "../ProfilePage/useHtmlTitle";

const ChatRoomsPage = () => {
  const rooms = useLoaderData() as UserRoom[] | undefined;

  useHtmlTitle("Your Chat Rooms - RoomRoom");

  return (
    <section className="scrollbar overflow-y-auto p-4 pt-14 md:pt-4 lg:col-start-3 lg:row-start-2 lg:border-r-2 lg:border-blue-600 lg:dark:border-blue-500">
      <h2 className="mb-2 text-center text-4 dark:text-blue-50">
        Your Chat Rooms
      </h2>
      {rooms?.length ? (
        <ul className="m-auto flex max-w-[432px] flex-col gap-y-3">
          {rooms.map((room) => (
            <li key={room.id}>
              <ExpandableRoom
                id={room.id}
                subject={room.subject}
                scope={room.scope}
                updatedAt={room.updatedAt}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center dark:text-blue-50">
          You haven&apos;t created any chat rooms yet.
        </div>
      )}
    </section>
  );
};

export default ChatRoomsPage;
