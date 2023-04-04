import classNames from "classnames";

interface FABProps {
  color: "primary" | "secondary" | "danger";
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel: string;
}

export const btnColors = {
  primary: "bg-blue-600 text-blue-50 dark:bg-blue-500 dark:text-dark",
  secondary: "bg-fuchsia-400 text-dark",
  danger: "bg-red-700 text-blue-50 dark:bg-red-500 dark:text-dark",
};

const FAB = ({ color, children, onClick, ariaLabel }: FABProps) => {
  const className = classNames(
    "h-12 w-12 shadow-8 rounded-full",
    btnColors[color],
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default FAB;
