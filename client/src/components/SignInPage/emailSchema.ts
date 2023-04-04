import { string } from "yup";

const emailSchema = string()
  .trim()
  .required("An email address is expected.")
  .email("This email address is invalid.")
  .typeError("This email address is invalid.");

export default emailSchema;
