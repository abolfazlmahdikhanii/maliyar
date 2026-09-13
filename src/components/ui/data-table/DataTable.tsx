import { Input, Table } from '@heroui/react'
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { useState } from 'react'

type DataTableProps<T>={
 data:T[],
 columns:ColumnDef<T>[]
}

const DataTable = <T,>({data,columns}:DataTableProps<T>) => {
    const [globalFilter,setGlobalFilter]=useState<string>("")
    const [sorting,setSorting]=useState<SortingState>([])
    const table=useReactTable({
        data,
        columns,
        state:{
            globalFilter,sorting
        },
        onGlobalFilterChange:setGlobalFilter,
        onSortingChange:setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),

        globalFilterFn: "includesString",
    })
   return (
    <div className="space-y-4">

      {/* Search */}
      <Input
        placeholder="جستجو..."
        value={globalFilter}
        onChange={e=>setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />


      <Table className="bg-[#37373A]">

        <Table.ScrollContainer>

          <Table.Content className="min-w-175">

            <Table.Header>

              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id}>

                  {headerGroup.headers.map((header) => (
                    <Table.Column
                      key={header.id}
                      className="
                        text-right
                        py-4
                        cursor-pointer
                        select-none
                        after:hidden
                      "
                      onClick={
                        header.column.getToggleSortingHandler()
                      }
                    >

                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[
                        header.column.getIsSorted() as string
                      ] ?? null}

                    </Table.Column>
                  ))}

                </Table.Row>
              ))}

            </Table.Header>


            <Table.Body>

              {table.getRowModel().rows.map((row) => (

                <Table.Row key={row.id}>

                  {row.getVisibleCells().map((cell)=>(

                    <Table.Cell
                      key={cell.id}
                      className="text-right"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Cell>

                  ))}

                </Table.Row>

              ))}

            </Table.Body>


          </Table.Content>

        </Table.ScrollContainer>

      </Table>

    </div>
  );
}

export default DataTable