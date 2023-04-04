import { LoaderFunction, redirect } from "react-router-dom";
import { User } from "../Root";
import axios from "../Root/axios";

export type RoomMessage =
  | {
      id: number;
      authorId: number;
      name: string;
      image: string | null;
      banned: boolean;
      createdAt: string;
      text: string | null;
      images: string[] | null;
      videos: string[] | null;
      gif: string | null;
    }
  | {
      id: number;
      authorId: null;
      name: null;
      image: null;
      banned: false;
      createdAt: string;
      text: string | null;
      images: string[] | null;
      videos: string[] | null;
      gif: string | null;
    };

export interface Room {
  id: number;
  subject: string;
  scope: "public" | "private";
  creatorId: number;
  memberIds: number[];
  messages: RoomMessage[];
  updatedAt: string;
  nbOfUnseenMsg?: number;
}

const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  const room = (await axios.get<Room>("/rooms/" + id, { csrf: true })).data;
  const user = (await axios.get<User>("/user")).data;

  if (room.scope === "private" && !room.memberIds.includes(user.id)) {
    return redirect("/");
  }

  return { room };
};

export default loader;
