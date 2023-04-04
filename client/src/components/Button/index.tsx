import classNames from "classnames";
import { btnColors } from "../FAB";

export type ButtonProps<T extends "submit" | "button" | "link"> = {
  color: "primary" | "secondary" | "danger";
  width: "fit" | "full";
  rounded?: "top" | "right" | "bottom" | "left";
  text: string;
  type: T;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  Icon?: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
} & (T extends "link" ? { href: string } : { href?: undefined });

export const btnStatesColors = {
  primary:
    "hover:bg-blue-800 active:bg-blue-900 focus:bg-blue-800 dark:hover:bg-blue-400 dark:active:bg-blue-300 dark:focus:bg-blue-400",
  secondary:
    "hover:bg-fuchsia-800 hover:text-blue-50 dark:hover:text-dark active:bg-fuchsia-900 active:text-blue-50 dark:active:text-dark focus:bg-fuchsia-800 focus:text-blue-50 dark:focus:text-dark dark:hover:bg-fuchsia-300 dark:active:bg-fuchsia-200 dark:focus:bg-fuchsia-300",
  danger:
    "hover:bg-red-800 active:bg-red-900 focus:bg-red-800 dark:hover:bg-red-400 dark:active:bg-red-300 dark:focus:bg-red-400",
};

const round = {
  top: "rounded-t-lg",
  right: "rounded-r-lg",
  bottom: "rounded-b-lg",
  left: "rounded-l-lg",
};

const Button = <T extends "submit" | "button" | "link">({
  color,
  type,
  rounded,
  href,
  width,
  onClick,
  Icon,
  text,
}: ButtonProps<T>) => {
  const btnClass = classNames(
    width === "fit" ? "w-fit" : "w-full",
    "flex flex-row flex-nowrap items-center justify-center gap-x-1 p-3 text-btn outline-none transition-colors duration-200",
    btnColors[color],
    btnStatesColors[color],
    rounded ? round[rounded] : "rounded-lg",
  );

  const ButtonOrLink = type === "link" ? "a" : "button";

  return (
    <ButtonOrLink
      {...(type === "link" ? { href } : { type })}
      onClick={onClick}
      className={btnClass}
    >
      {Icon && (
        <div>
          <Icon />
        </div>
      )}
      {text}
    </ButtonOrLink>
  );
};

export default Button;
