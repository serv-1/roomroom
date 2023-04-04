import { useId, useRef, useState } from "react";
import env from "../../env";
import FieldError from "../FieldError";
import FieldLabel from "../FieldLabel";
import useFocusElement from "../RadiosField/useFocusElement";
import { User } from "../Root";
import { ReactComponent as Add24Icon } from "../../images/add_24.svg";
import classNames from "classnames";
import { Validate } from "../SignInPage/useForm";

const awsUrl = env.AWS_URL + "/";

interface ImageFieldProps {
  isFocused?: boolean;
  image?: User["image"];
  error?: string;
  validate: Validate<"image">;
}

const ImageField = ({ isFocused, image, error, validate }: ImageFieldProps) => {
  const [preview, setPreview] = useState<string>();

  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  useFocusElement(inputRef, isFocused);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = (e.currentTarget.files as FileList)[0];
    const error = await validate("image", image);

    if (error) {
      return setPreview(undefined);
    }

    const reader = new FileReader();

    reader.onloadend = (e) => {
      setPreview((e.target as FileReader).result as string);
    };

    reader.readAsDataURL(image);
  };

  const btnClassNames = classNames(
    "flex w-full items-center justify-center text-dark",
    error
      ? "bg-red-100 hover:bg-red-200 focus:bg-red-200 dark:bg-red-300 hover:bg-red-400 focus:bg-red-400"
      : "bg-blue-100 hover:bg-fuchsia-100 focus:bg-fuchsia-100 dark:bg-blue-300 dark:hover:bg-fuchsia-300 dark:focus:bg-fuchsia-300",
  );

  return (
    <div>
      <FieldLabel id={id} text="Image" />
      <div className="flex h-[76px] flex-row flex-nowrap overflow-clip rounded-lg">
        {(preview || image) && (
          <img
            src={preview ? preview : awsUrl + image}
            alt={preview ? "Uploaded image" : "Actual profile image"}
            width={76}
            height={76}
            className="object-cover"
            loading="lazy"
          />
        )}
        <input
          type="file"
          name="image"
          id={id}
          onChange={handleChange}
          ref={inputRef}
          className="hidden"
        />
        <button
          className={btnClassNames}
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Update your profile image"
        >
          <Add24Icon />
        </button>
      </div>
      <FieldError error={error} />
    </div>
  );
};

export default ImageField;
