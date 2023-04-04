import { useState } from "react";
import { UserRoom } from "../ProfilePage/loader";
import Room from "../Room";
import { ReactComponent as ExpandLessIcon } from "../../images/expand_less_24.svg";
import { ReactComponent as ExpandMoreIcon } from "../../images/expand_more_24.svg";
import TextField from "../TextField";
import useForm from "../SignInPage/useForm";
import { object } from "yup";
import DeleteRoomModal from "../DeleteRoomModal";
import { subjectSchema } from "../CreateRoomModal";
import axios from "../Root/axios";
import InviteModal from "../InviteModal";

const schema = object({ subject: subjectSchema });

interface ExpandableRoomProps {
  id: UserRoom["id"];
  subject: UserRoom["subject"];
  scope: UserRoom["scope"];
  updatedAt: UserRoom["updatedAt"];
}

const ExpandableRoom = ({
  id,
  subject: defaultSubject,
  scope,
  updatedAt,
}: ExpandableRoomProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);

  const { validate, handleSubmit, errors } = useForm(schema);

  const onSubmit = handleSubmit(async (data) => {
    await axios.put("/rooms/" + id, { data, csrf: true });
    setSubject(data.subject);
  });

  return isDeleted ? null : (
    <div className="relative">
      <Room
        id={id}
        subject={subject}
        scope={scope}
        updatedAt={updatedAt}
        isExpanded={isExpanded}
      />
      <button
        className="absolute -top-1 -right-1 rounded-full bg-blue-400"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Hide" : "Expand"}
      >
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </button>
      {isExpanded && (
        <div className="rounded-b-lg bg-blue-100 p-1 dark:bg-dark-1 md:p-2">
          <form
            method="post"
            className="mb-1 md:mb-2"
            noValidate
            onSubmit={onSubmit}
          >
            <TextField
              type="text"
              name="subject"
              label="Subject"
              validate={validate}
              btnText="Update"
              error={errors.subject}
            />
          </form>
          <div className="flex flex-row flex-nowrap gap-x-1 md:gap-x-2">
            {scope === "private" && <InviteModal roomId={id} />}
            <DeleteRoomModal
              id={id}
              subject={subject}
              setIsDeleted={setIsDeleted}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandableRoom;
