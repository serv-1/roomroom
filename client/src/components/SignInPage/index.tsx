import { Form, useActionData } from "react-router-dom";
import Button from "../Button";
import TextField from "../TextField";
import { object } from "yup";
import { ReactComponent as SendIcon } from "../../images/send_20.svg";
import useForm from "../SignInPage/useForm";
import emailSchema from "./emailSchema";
import ThemeSwitch from "../ThemeSwitch";
import env from "../../env";

const schema = object({ email: emailSchema });

const SignInPage = () => {
  const mailSent = useActionData() as true | undefined;
  const { errors, handleSubmit, validate } = useForm(schema);

  return (
    <div className="text-dark dark:bg-dark flex min-h-screen flex-col items-center justify-center bg-blue-50 px-4 dark:text-blue-50">
      <div className="relative w-full max-w-[372px]">
        <h1 className="text-1 absolute -top-[76px] w-full text-center">
          RoomRoom
        </h1>
        <div className="dark:bg-dark-1 flex flex-col gap-y-4 rounded-2xl bg-blue-100 p-2 md:p-4">
          {mailSent ? (
            <>
              <p className="text-4 text-center">
                We have sent you an email with a magic link to sign in.
              </p>
              <span className="text-center text-sm">
                You can close this tab.
              </span>
            </>
          ) : (
            <>
              <h2 className="text-5">Sign in</h2>
              <Form
                method="post"
                className="flex flex-col gap-y-2"
                noValidate
                onSubmit={handleSubmit()}
              >
                <TextField
                  type="email"
                  name="email"
                  label="Email"
                  error={errors.email}
                  validate={validate}
                  isFocused
                />
                <div className="self-end">
                  <Button
                    color="primary"
                    width="fit"
                    type="submit"
                    text="Send"
                    Icon={SendIcon}
                  />
                </div>
              </Form>
              <span className="block w-full text-center">Or</span>
              <Button
                color="primary"
                width="full"
                text="Sign in with Google"
                type="link"
                href={env.REST_URL + "/auth/google"}
              />
            </>
          )}
        </div>
        <div className="mt-8 flex flex-row justify-center">
          <div className="dark:bg-dark-1 rounded-lg bg-blue-100 p-2 lg:bg-transparent lg:p-0">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
