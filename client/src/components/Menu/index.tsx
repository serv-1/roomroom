import MenuLink, { menuLinkBaseClass } from "../MenuLink";
import { ReactComponent as HomeIcon } from "../../images/home_20.svg";
import { ReactComponent as HomeFillIcon } from "../../images/home_20_fill.svg";
import { ReactComponent as ProfileIcon } from "../../images/account_circle_20.svg";
import { ReactComponent as ProfileFillIcon } from "../../images/account_circle_20_fill.svg";
import { ReactComponent as RoomsIcon } from "../../images/forum_20.svg";
import { ReactComponent as RoomsFillIcon } from "../../images/forum_20_fill.svg";
import { ReactComponent as SignOutIcon } from "../../images/logout_20.svg";
import axios from "../Root/axios";
import { Link, useNavigate } from "react-router-dom";
import ThemeSwitch from "../ThemeSwitch";

const Menu = () => {
  const navigate = useNavigate();

  const signOut = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await axios.delete("/auth/sign-out");
    navigate(0);
  };

  return (
    <nav className="md:p-4">
      <ul>
        <li>
          <MenuLink
            Icon={HomeIcon}
            IconActive={HomeFillIcon}
            label="Home"
            to="/"
          />
        </li>
        <li>
          <MenuLink
            Icon={ProfileIcon}
            IconActive={ProfileFillIcon}
            label="Profile"
            to="/profile"
          />
        </li>
        <li>
          <MenuLink
            Icon={RoomsIcon}
            IconActive={RoomsFillIcon}
            label="Rooms"
            to="/rooms"
          />
        </li>
        <li>
          <Link to="/" className={menuLinkBaseClass} onClick={signOut}>
            <SignOutIcon className="dark:text-blue-400 lg:dark:text-blue-50" />
            Sign out
          </Link>
        </li>
        <li className="p-3 md:pt-4">
          <ThemeSwitch />
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
