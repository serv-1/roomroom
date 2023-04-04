import classNames from "classnames";
import { useRef } from "react";
import FieldError from "../FieldError";
import { Validate } from "../SignInPage/useForm";
import useFocusElement from "./useFocusElement";

interface RadiosFieldProps<T extends string> {
  name: T;
  radios: {
    value: string;
    label: string;
    note?: string;
  }[];
  isFocused?: boolean;
  error?: string;
  validate: Validate<T>;
}

const RadiosField = <T extends string>({
  name,
  radios,
  isFocused,
  error,
  validate,
}: RadiosFieldProps<T>) => {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useFocusElement(firstInputRef, isFocused);

  const radioClassName = classNames(
    "my-1 h-4 w-4 shrink-0 appearance-none rounded-full border-2 transition-[background-color,box-shadow] duration-200 checked:shadow-[2px_2px_0_#EFF6FF_inset,-2px_-2px_0_#EFF6FF_inset,2px_-2px_0_#EFF6FF_inset,-2px_2px_0_#EFF6FF_inset] dark:checked:shadow-[2px_2px_0_#3B4048_inset,-2px_-2px_0_#3B4048_inset,2px_-2px_0_#3B4048_inset,-2px_2px_0_#3B4048_inset]",
    error
      ? "border-red-700 checked:bg-red-700 dark:border-red-500 dark:checked:bg-red-500"
      : "border-blue-600 checked:bg-blue-600 dark:border-blue-500 dark:checked:bg-blue-500",
  );

  return (
    <div className="flex flex-col">
      {radios.map(({ value, label, note }, i) => (
        <div
          key={value}
          className="mb-4 flex flex-row flex-nowrap gap-x-1 last-of-type:mb-0"
        >
          <input
            type="radio"
            id={value}
            name={name}
            value={value}
            onChange={async (e) => await validate(name, e.currentTarget.value)}
            ref={i === 0 ? firstInputRef : undefined}
            className={radioClassName}
            aria-describedby={note ? value + "-note" : undefined}
          />
          <div>
            <label htmlFor={value}>{label}</label>
            {note && (
              <span id={value + "-note"} className="block text-sm">
                {note}
              </span>
            )}
          </div>
        </div>
      ))}
      <FieldError error={error} />
    </div>
  );
};

export default RadiosField;
