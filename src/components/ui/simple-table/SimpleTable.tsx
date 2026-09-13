import { Table } from "@heroui/react";
import type { ReactNode } from "react";

type SimpleTableProps = {
  headers: Record<string, string>;
 children:ReactNode
};

const SimpleTable = ({
  headers,
  children,
}: SimpleTableProps) => {
   
  return (
    <Table className="bg-[#37373A] ">
      <Table.ScrollContainer>
        <Table.Content className="w-full">
          <Table.Header className={"bg-[#37373A]"}>
            {Object.values(headers).map((item) => (
              <Table.Column
                key={item}
                isRowHeader
                className={"text-right pl-2 after:hidden py-4"}
              >
                {item}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
          {children}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
};

export default SimpleTable;
