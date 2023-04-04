import Menu from "../Menu";
import CreateRoomModal from "../CreateRoomModal";

const SideBar = () => {
  return (
    <div className="z-30 md:row-span-2 md:bg-blue-700 md:shadow-8 md:dark:bg-dark-8 lg:col-start-2 lg:border-x-2 lg:border-blue-600 lg:bg-blue-50 lg:shadow-none lg:dark:border-blue-500 lg:dark:bg-dark">
      <h1 className="hidden px-4 py-3 text-4 text-blue-50 md:block lg:border-b-2 lg:border-blue-600 lg:text-dark lg:dark:border-blue-500 lg:dark:text-blue-50">
        RoomRoom
      </h1>
      <CreateRoomModal />
      <div className="hidden md:block">
        <Menu />
      </div>
    </div>
  );
};

export default SideBar;
