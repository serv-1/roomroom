import { useEffect, useState } from "react";
import Member from "../Member";
import { User } from "../Root";
import axios from "../Root/axios";

type Member = Omit<User, "email">;

interface MemberListProps {
  userId: number;
  creatorId: number;
  roomSubject: string;
  memberIds: number[];
  isRoomPrivate: boolean;
}

const MemberList = ({
  userId,
  creatorId,
  roomSubject,
  memberIds,
  isRoomPrivate,
}: MemberListProps) => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const getMembers = async () => {
      const members: Member[] = [];

      for (const memberId of memberIds) {
        members.push((await axios.get<Member>("/users/" + memberId)).data);
      }

      setMembers(members);
    };
    getMembers();
  }, [memberIds]);

  return (
    <ul className="scrollbar flex max-h-96 flex-col gap-y-2 overflow-y-auto">
      {members.map((member) => (
        <Member
          key={member.id}
          {...member}
          userId={userId}
          creatorId={creatorId}
          roomSubject={roomSubject}
          isRoomPrivate={isRoomPrivate}
        />
      ))}
    </ul>
  );
};

export default MemberList;
