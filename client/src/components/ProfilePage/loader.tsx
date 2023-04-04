import { LoaderFunction } from "react-router-dom";
import { Room } from "../ChatRoomPage/loader";
import { User } from "../Root";
import axios from "../Root/axios";

export type UserRoom = Pick<
  Room,
  "id" | "subject" | "scope" | "updatedAt" | "nbOfUnseenMsg"
>;

const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  let user: User | Omit<User, "email">;

  if (id) {
    user = (await axios.get<Omit<User, "email">>("/users/" + id)).data;
  } else {
    user = (await axios.get<User>("/user")).data;
  }

  const rooms = (
    await axios.get<{ rooms: UserRoom[] }>("/rooms/?userId=" + user.id)
  ).data.rooms;

  return { user, rooms };
};

export default loader;
