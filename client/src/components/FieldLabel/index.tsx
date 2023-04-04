interface FieldLabelProps {
  id: string;
  text: string;
}

const FieldLabel = ({ id, text }: FieldLabelProps) => {
  return (
    <label htmlFor={id} className="text-sm dark:text-blue-50">
      {text}
    </label>
  );
};

export default FieldLabel;
