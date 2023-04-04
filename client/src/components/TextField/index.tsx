import classNames from "classnames";
import { useId, useRef } from "react";
import Button from "../Button";
import FieldError from "../FieldError";
import FieldLabel from "../FieldLabel";
import useFocusElement from "../RadiosField/useFocusElement";
import { Validate } from "../SignInPage/useForm";

export interface TextFieldProps<T extends string> {
  type: "text" | "email" | "textarea";
  name: T;
  label: string;
  isFocused?: boolean;
  error?: string;
  validate?: Validate<T>;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  btnText?: string;
}

const TextField = <T extends string>({
  type,
  name,
  label,
  isFocused,
  error,
  validate,
  onChange,
  btnText,
}: TextFieldProps<T>) => {
  const id = useId();
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  const className = classNames(
    "border-2 p-2 outline-none bg-transparent transition-colors duration-200 text-dark dark:text-blue-50",
    btnText ? "w-full rounded-l-lg" : "rounded-lg",
    error
      ? "border-red-700 hover:border-red-800 dark:hover:border-red-600 focus:border-red-800 dark:focus:border-red-600 dark:border-red-500"
      : "border-blue-600 hover:border-fuchsia-400 dark:hover:border-fuchsia-400 focus:border-fuchsia-400 dark:focus:border-fuchsia-400 dark:border-blue-500",
  );

  useFocusElement(inputRef, isFocused);

  const handleChange: typeof onChange = async (e) => {
    if (validate) await validate(name, e.currentTarget.value);
    if (onChange) onChange(e);
  };

  const attributes = {
    id,
    name,
    className,
    onChange: handleChange,
    ref: (e: HTMLInputElement | HTMLTextAreaElement | null) =>
      (inputRef.current = e),
  };

  const input =
    type === "textarea" ? (
      <textarea {...attributes} className={className + " h-20"}></textarea>
    ) : (
      <input type={type} {...attributes} />
    );

  return (
    <div className="flex flex-col">
      <FieldLabel id={id} text={label} />
      {btnText ? (
        <div className="flex flex-row flex-nowrap">
          {input}
          <Button
            color="primary"
            width="fit"
            type="submit"
            text={btnText}
            rounded="right"
          />
        </div>
      ) : (
        input
      )}
      <FieldError error={error} />
    </div>
  );
};

export default TextField;
