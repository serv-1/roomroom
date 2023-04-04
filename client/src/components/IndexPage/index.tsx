import { useEffect, useRef, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { Room as IRoom } from "../ChatRoomPage/loader";
import useIntersectionObserver from "../ChatMessageBox/useIntersectionObserver";
import Room from "../Room";
import axios from "../Root/axios";

export interface SearchedRoom {
  id: IRoom["id"];
  subject: IRoom["subject"];
  updatedAt: IRoom["updatedAt"];
}

const IndexPage = () => {
  const initialRooms = useLoaderData() as SearchedRoom[];

  const [rooms, setRooms] = useState(initialRooms);

  const [searchParams] = useSearchParams();

  const listEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  useIntersectionObserver(
    listEnd,
    async ([{ isIntersecting }]) => {
      if (!isIntersecting || rooms.length < 20) return;

      const query = searchParams.get("query");

      const nextRooms = (
        await axios.get<{ rooms: SearchedRoom[] }>(
          "/rooms/search?id=" +
            rooms[rooms.length - 1].id +
            (query ? "&subject=" + query : ""),
        )
      ).data.rooms;

      if (nextRooms.length) setRooms((s) => [...s, ...nextRooms]);
    },
    { deps: [rooms] },
  );

  return (
    <section className="scrollbar overflow-hidden overflow-y-auto p-4 pt-14 md:pt-4 lg:col-start-3 lg:row-start-2 lg:border-r-2 lg:border-blue-600 lg:dark:border-blue-500">
      {rooms.length ? (
        <>
          <ul className="m-auto flex max-w-[432px] flex-col gap-y-2">
            {rooms.map((room) => (
              <li key={room.id}>
                <Room {...room} />
              </li>
            ))}
          </ul>
          <div ref={listEnd}></div>
        </>
      ) : (
        <p className="text-center dark:text-blue-50">
          We didn&apos;t found any Chat Rooms.
        </p>
      )}
    </section>
  );
};

export default IndexPage;
