import classNames from "classnames";
import env from "../../env";
import { User } from "../Root";

const awsUrl = env.AWS_URL + "/";

interface UserImageProps {
  name: User["name"];
  image?: User["image"];
  size: 40 | 76;
  inButton?: boolean;
}

const UserImage = ({ name, image, size, inButton }: UserImageProps) => {
  const bgHoverClass = "group-hover:bg-fuchsia-400 group-focus:bg-fuchsia-400";

  return image ? (
    <img
      className={classNames(
        size === 40 ? "h-10 w-10" : "h-[76px] w-[76px]",
        "shrink-0 overflow-hidden rounded-full object-cover",
      )}
      src={awsUrl + image}
      alt={name + "'s profile picture"}
      width={size}
      height={size}
      loading="lazy"
    />
  ) : (
    <div
      className={classNames(
        size === 40 ? "h-10 w-10 border-[3px]" : "h-[76px] w-[76px] border-4",
        inButton &&
          "group-hover:border-fuchsia-400 group-focus:border-fuchsia-400",
        "relative shrink-0 overflow-clip rounded-full border-blue-600 dark:border-blue-500",
      )}
    >
      <div
        className={classNames(
          inButton && bgHoverClass,
          size === 40 ? "top-1 h-4 w-4" : "top-2 h-8 w-8",
          "absolute left-1/2 -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-500",
        )}
      ></div>
      <div
        className={classNames(
          inButton && bgHoverClass,
          size === 40 ? "-bottom-2 h-5" : "-bottom-2 h-8",
          "absolute w-full rounded-[100%] bg-blue-600 dark:bg-blue-500",
        )}
      ></div>
    </div>
  );
};

export default UserImage;
