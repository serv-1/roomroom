import { User } from "../Root";
import BanConfirmationModal from "../BanConfirmationModal";
import UserImage from "../UserImage";

interface MemberProps extends Omit<User, "email"> {
  userId: number;
  roomSubject: string;
  creatorId: number;
  isRoomPrivate: boolean;
}

const Member = ({
  id,
  name,
  image,
  userId,
  roomSubject,
  creatorId,
  isRoomPrivate,
}: MemberProps) => {
  return (
    <li className="flex flex-row flex-nowrap justify-between">
      <div className="flex flex-row flex-nowrap items-center gap-x-2">
        <UserImage name={name} image={image} size={40} />
        {name}
      </div>
      {isRoomPrivate && creatorId === userId && creatorId !== id && (
        <BanConfirmationModal
          userId={id}
          userName={name}
          roomSubject={roomSubject}
        />
      )}
    </li>
  );
};

export default Member;
