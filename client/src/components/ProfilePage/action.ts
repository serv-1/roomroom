import { AxiosError } from "axios";
import { ActionFunction } from "react-router-dom";
import axios from "../Root/axios";
import addToS3 from "./addToS3";

export interface UniquenessError {
  field?: "name" | "email";
  error: string;
}

const action: ActionFunction = async ({ request }) => {
  const reqData = Object.fromEntries<string | File>(await request.formData());

  for (const prop in reqData) {
    if (!reqData[prop] || (reqData[prop] as File).size === 0) {
      delete reqData[prop];
    }
  }

  if (Array.from(Object.keys(reqData)).length === 0) return null;

  if (reqData.image) reqData.image = await addToS3(reqData.image as File);

  try {
    await axios.put("/user", { data: reqData, csrf: true });
    return null;
  } catch (e) {
    const { response } = e as AxiosError<UniquenessError>;

    if (response?.data.field) {
      return response.data;
    }

    throw e;
  }
};

export default action;
