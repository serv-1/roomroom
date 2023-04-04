import { LoaderFunction } from "react-router-dom";
import { SearchedRoom } from ".";
import { subjectSchema } from "../CreateRoomModal";
import axios from "../Root/axios";

const loader: LoaderFunction = async ({ request }) => {
  const query = new URL(request.url).searchParams.get("query");

  const isValid = await subjectSchema.isValid(query);
  const url = "/rooms/search" + (isValid ? "?subject=" + query : "");

  return (await axios.get<{ rooms: SearchedRoom[] }>(url)).data.rooms;
};

export default loader;
