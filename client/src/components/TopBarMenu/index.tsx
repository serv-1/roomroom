import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Menu from "../Menu";
import { ReactComponent as MenuIcon } from "../../images/menu_24.svg";
import { ReactComponent as CloseIcon } from "../../images/close_24.svg";

const TopBarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative md:hidden">
      <button className="p-2 text-blue-50" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-10 overflow-clip rounded-br-lg bg-blue-600 shadow-3 dark:bg-dark-3 md:static md:bg-transparent md:shadow-none md:dark:bg-transparent">
          <Menu />
        </div>
      )}
    </div>
  );
};

export default TopBarMenu;
