type CheckboxItemProps = {
  title: string;
  description: string;
  checked?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

const CheckboxItem = ({
  title,
  description,
  checked,
  disabled,
  onChange,
}: CheckboxItemProps) => (
  <label className="flex items-center justify-between gap-4 py-4 border-y border-dashed border-secondary  cursor-pointer">
    <span className="text-sm text-neutral-100">
      {title}
      <small className="block text-xs text-neutral-400 mt-1">{description}</small>
    </span>
    <input
      type="checkbox"
      className="size-5 accent-primary shrink-0"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);

export default CheckboxItem;