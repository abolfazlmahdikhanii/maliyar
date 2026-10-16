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
    <section className="grid grid-cols-2 w-full gap-x-1 p-1.5 bg-secondary rounded-xl max-w-2xl border border-secondary">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`transaction-type ${
            selectedTab === tab.value
              ? tab.selectedColor
              : "text-muted hover:bg-secondary/80"
          }`}
          onClick={() => setSelectedTab(tab.value)}
        >
          {tab.title}
        </div>
      ))}
    </section>
  );
};

export default FormTab;
