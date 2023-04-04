import { useState } from "react";
import { useSubmit } from "react-router-dom";
import { ObjectSchema, reach, ValidationError } from "yup";
import { AssertsShape, ObjectShape, TypeOfShape } from "yup/lib/object";

type Errors<T> = {
  [Property in keyof T]?: string;
};

const useForm = <T extends ObjectShape>(schema: ObjectSchema<T>) => {
  const [errors, setErrors] = useState<Errors<T>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = useSubmit();

  const handleSubmit = (cb?: Callback<T>) => {
    return async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (Object.keys(errors).length > 0) return;

      if (!isSubmitted) setIsSubmitted(true);

      const data = Object.fromEntries(new FormData(e.currentTarget));

      try {
        const result = await schema.validate(data, { abortEarly: false });

        if (cb) return await cb(result);

        submit(e.target as HTMLFormElement);
      } catch (err) {
        const errors: Record<string, string> = {};

        for (const error of (err as ValidationError).inner) {
          errors[error.path as string] = error.message;
        }

        setErrors((prev) => ({ ...prev, ...errors }));
      }
    };
  };

  const validate: Validate<keyof T> = async (name, value) => {
    if (!isSubmitted) return;

    try {
      await reach(schema, name as string).validate(value);

      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } catch (e) {
      const { message } = e as ValidationError;

      setError(name, message);

      return message;
    }
  };

  const setError = (name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return { errors, handleSubmit, validate, setError };
};

export default useForm;

export type Validate<T extends string | number | symbol> = (
  name: T,
  value: unknown,
) => Promise<string | undefined>;

export type Callback<T extends ObjectShape> = (
  data: AssertsShape<T> | Extract<TypeOfShape<T>, null | undefined>,
) => void | Promise<void>;
