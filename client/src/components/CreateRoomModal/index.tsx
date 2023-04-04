import { useState } from "react";
import FAB from "../FAB";
import Modal from "../Modal";
import { ReactComponent as Add24Icon } from "../../images/add_24.svg";
import { ReactComponent as Add20Icon } from "../../images/add_20.svg";
import { Form, useLocation } from "react-router-dom";
import useForm from "../SignInPage/useForm";
import { object, string } from "yup";
import TextField from "../TextField";
import Button from "../Button";
import RadiosField from "../RadiosField";
import classNames from "classnames";

export const subjectSchema = string()
  .required("A subject is required.")
  .trim()
  .typeError("The subject is invalid.")
  .max(150, "The subject cannot exceed 150 characters.");

const createRoomSchema = object({
  subject: subjectSchema,
  scope: string()
    .trim()
    .typeError("The scope must be either public or private.")
    .required("A scope is required.")
    .matches(
      /^(public|private)$/,
      "The scope must be either public or private.",
    ),
});

const CreateRoomModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { errors, validate, handleSubmit } = useForm(createRoomSchema);

  const { pathname } = useLocation();

  return (
    <>
      <div
        className={classNames(
          /\/rooms\//.test(pathname) && "hidden md:block",
          "fixed bottom-2 right-2 z-10 md:static md:px-4 md:pt-4",
        )}
      >
        <div className="md:hidden">
          <FAB
            color="primary"
            ariaLabel="Create a room"
            onClick={() => setIsOpen(true)}
          >
            <Add24Icon className="m-auto" />
          </FAB>
        </div>
        <div className="hidden md:block">
          <Button
            color="primary"
            width="full"
            text="Create"
            Icon={Add20Icon}
            type="button"
            onClick={() => setIsOpen(true)}
          />
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onModalClose={() => setIsOpen(false)}
        title="Create your Chat Room"
      >
        <Form
          method="post"
          noValidate
          onSubmit={handleSubmit()}
          className="flex flex-col gap-y-4"
        >
          <TextField
            type="text"
            name="subject"
            label="Subject"
            error={errors.subject}
            validate={validate}
            isFocused
          />
          <RadiosField
            name="scope"
            radios={[
              {
                value: "public",
                label: "Public",
                note: "Everyone can join. You cannot ban members.",
              },
              {
                value: "private",
                label: "Private",
                note: "Only invited users can join. You can ban members.",
              },
            ]}
            error={errors.scope}
            validate={validate}
          />
          <Button color="primary" type="submit" width="full" text="Create" />
        </Form>
      </Modal>
    </>
  );
};

export default CreateRoomModal;
