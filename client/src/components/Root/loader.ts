import { LoaderFunction } from "react-router-dom";
import { User } from ".";
import axios from "./axios";

const loader: LoaderFunction = async () => {
  const res = await axios.get<User | undefined>("/user");
  return res.data;
};

export default loader;
