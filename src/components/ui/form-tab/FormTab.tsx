interface Tab {
  id: number;
  title: string;
  value: string;
  selectedColor: string;
}
type FormTabProps = {
  tabs: Tab[];
  selectedTab: string;
  setSelectedTab: (a: string) => void;
};

const FormTab = ({ tabs, selectedTab, setSelectedTab }: FormTabProps) => {
  return (
    <section
      role="tablist"
      className="grid w-full max-w-2xl auto-cols-fr grid-flow-col gap-x-1 rounded-xl border border-secondary bg-secondary p-1.5"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={selectedTab === tab.value}
          className={`transaction-type ${
            selectedTab === tab.value
              ? tab.selectedColor
              : "text-muted hover:bg-secondary/80"
          }`}
          onClick={() => setSelectedTab(tab.value)}
        >
          {tab.title}
        </button>
      ))}
    </section>
  );
};

export default FormTab;
