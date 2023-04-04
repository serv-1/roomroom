import { LoaderFunction } from "react-router-dom";
import { UserRoom } from "../ProfilePage/loader";
import axios from "../Root/axios";

const loader: LoaderFunction = async () => {
  const rooms = (
    await axios.get<{ rooms: UserRoom[] }>("/user/rooms", { csrf: true })
  ).data.rooms;

  return rooms;
};

export default loader;
