import { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import { mixed, object, string } from "yup";
import Button from "../Button";
import ImageField from "../ImageField";
import Modal from "../Modal";
import { User } from "../Root";
import emailSchema from "../SignInPage/emailSchema";
import useForm from "../SignInPage/useForm";
import TextField from "../TextField";
import { ReactComponent as EditIcon } from "../../images/edit_20.svg";
import { UniquenessError } from "../ProfilePage/action";

const schema = object({
  image: mixed()
    .test(
      "size",
      "The image must have a size inferior to 1mb.",
      (value: File) => {
        return value.size < 1000000;
      },
    )
    .test(
      "type",
      "An image (.jpg, .jpeg, .png, .gif) is expected.",
      (value: File) => {
        return (
          value.size === 0 ||
          ["image/jpeg", "image/png", "image/gif"].includes(value.type)
        );
      },
    ),
  name: string()
    .trim()
    .max(40, "The name cannot exceed ${max} characters.")
    .typeError("This name is invalid."),
  email: emailSchema.optional(),
});

interface UpdateUserModalProps {
  user: User;
  error?: Required<UniquenessError>;
}

const UpdateUserModal = ({ user, error }: UpdateUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { errors, validate, handleSubmit, setError } = useForm(schema);

  useEffect(() => {
    if (!error) return;
    setError(error.field, error.error);
  }, [error]);

  return (
    <>
      <button
        className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-0.5 text-blue-50 hover:bg-fuchsia-400 hover:text-dark focus:bg-fuchsia-400 focus:text-dark dark:bg-blue-500 dark:text-dark dark:hover:bg-fuchsia-400 dark:focus:bg-fuchsia-400"
        aria-label="Update your account"
        onClick={() => setIsOpen(true)}
      >
        <EditIcon />
      </button>
      <Modal
        isOpen={isOpen}
        onModalClose={() => setIsOpen(false)}
        title="Update"
      >
        <p>Updating your email will sign you out.</p>
        <Form
          method="post"
          className="flex flex-col gap-y-4"
          noValidate
          onSubmit={handleSubmit()}
          encType="multipart/form-data"
        >
          <ImageField
            isFocused
            validate={validate}
            error={errors.image}
            image={user.image}
          />
          <TextField
            type="text"
            name="name"
            label="Name"
            error={errors.name}
            validate={validate}
          />
          <TextField
            type="email"
            name="email"
            label="Email"
            error={errors.email}
            validate={validate}
          />
          <Button color="primary" width="full" text="Update" type="submit" />
        </Form>
      </Modal>
    </>
  );
};

export default UpdateUserModal;
