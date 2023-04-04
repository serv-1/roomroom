import classNames from "classnames";
import { NavLink } from "react-router-dom";

export const menuLinkBaseClass =
  "flex items-center gap-x-3 p-3 transition-colors duration-200 md:rounded-lg md:p-2 md:hover:bg-blue-600 md:dark:hover:bg-dark-4 lg:hover:bg-blue-100 lg:dark:hover:bg-dark-1 whitespace-nowrap text-blue-50 md:dark:text-blue-50 lg:text-dark";

interface MenuLinkProps {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  IconActive: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  to: string;
}

const MenuLink = ({ Icon, IconActive, label, to }: MenuLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        classNames(menuLinkBaseClass, "md:mb-2", {
          "bg-blue-700 dark:bg-dark-8 md:bg-blue-600 md:dark:bg-dark-4 lg:bg-blue-100 lg:dark:bg-dark-1":
            isActive,
        })
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <IconActive className="dark:text-blue-400 lg:dark:text-blue-50" />
          ) : (
            <Icon className="dark:text-blue-400 lg:dark:text-blue-50" />
          )}
          {label}
        </>
      )}
    </NavLink>
  );
};

export default MenuLink;
