type SidebarItemSettingProps = {
  id: string;
  name: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const SidebarItemSetting = ({
  id,
  name,
  selectedId,
  onSelect,
}: SidebarItemSettingProps) => {
  const scrollTo = () => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    onSelect(id);
  };

  return (
    <button
      type="button"
      onClick={scrollTo}
      className={`flex items-center gap-2.5 py-3.5 px-4.5 rounded-[14px] transition-all duration-200 w-full ${
        id === selectedId
          ? "text-primary bg-primary/15"
          : "text-neutral-400 hover:bg-[rgba(255,255,255,0.05)] hover:text-neutral-300"
      }`}
    >
      <p className="text-[15px]">{name}</p>
    </button>
  );
};

export default SidebarItemSetting;
