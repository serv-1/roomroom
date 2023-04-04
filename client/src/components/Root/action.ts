import { ActionFunction, redirect } from "react-router-dom";
import axios from "./axios";

const action: ActionFunction = async ({ request }) => {
  const data = Object.fromEntries(await request.formData());

  if (data.email) {
    await axios.post("/auth/email", { data: { destination: data.email } });
    return true;
  }

  const res = await axios.post<{ id: string }>("/rooms", { data, csrf: true });

  return redirect("/rooms/" + res.data.id);
};

export default action;
