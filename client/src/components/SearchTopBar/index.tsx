import classNames from "classnames";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as SearchIcon } from "../../images/search_24.svg";
import { subjectSchema } from "../CreateRoomModal";
import TopBarMenu from "../TopBarMenu";

const SearchTopBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const query = new FormData(e.currentTarget).get("query");

    if (!(await subjectSchema.isValid(query))) return;

    navigate("/?query=" + query);
  };

  return (
    <div
      className={classNames(
        "fixed z-20 w-full flex-row flex-nowrap bg-blue-600 pr-2 text-blue-50 shadow-2 dark:bg-dark-2 md:static md:gap-x-4 md:p-4 md:shadow-3 md:dark:bg-dark-3 lg:border-r-2 lg:border-b-2 lg:border-blue-600 lg:bg-blue-50 lg:text-dark lg:shadow-none lg:dark:border-blue-500 lg:dark:bg-dark lg:dark:text-blue-50",
        /\/rooms\//.test(pathname) ? "hidden md:flex" : "flex",
      )}
    >
      <TopBarMenu />
      <form
        name="search"
        method="get"
        noValidate
        onSubmit={onSubmit}
        className="flex w-full flex-row flex-nowrap gap-x-2"
      >
        <input
          type="search"
          name="query"
          className="w-full bg-transparent outline-none placeholder:text-blue-50/60 lg:placeholder:text-dark lg:dark:placeholder:text-blue-50"
          placeholder="Search"
        />
        <button type="submit" aria-label="Search">
          <SearchIcon />
        </button>
      </form>
    </div>
  );
};

export default SearchTopBar;
