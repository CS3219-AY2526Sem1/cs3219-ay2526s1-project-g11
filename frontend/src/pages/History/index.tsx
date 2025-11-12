import { Button, Flex, Select, Table, TextField } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { userStatistics } from "../../api/UserService";
import { useAuth } from "../../context/AuthContext";
import type { UserSession } from "../../types/types";
import { twcn } from "../../utils";

const History = () => {
  const { user } = useAuth();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startTimestamp", desc: true },
  ]);

  const { data } = useQuery({
    queryKey: ["userStatistics"],
    // @ts-expect-error We make sure user is defined in enabled
    queryFn: () => userStatistics({ userId: user.id }),
    enabled: !!user?.id,
  });

  const userDef = useMemo<ColumnDef<UserSession>[]>(
    () => [
      {
        header: "Question",
        accessorKey: "question.title",
        enableSorting: false,
      },
      {
        header: "Peer Name",
        accessorKey: "peerName",
        enableSorting: false,
      },
      {
        header: ({ column }) => (
          <Flex align="center" gap="2" className="cursor-pointer">
            Start Time
            <span
              className={twcn("cursor-pointer", {
                "opacity-50": !column.getIsSorted(),
              })}
            >
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          </Flex>
        ),
        accessorKey: "startTimestamp",
        cell: ({ getValue }) => format(getValue<Date>(), "dd/MM/yyyy HH:mm:ss"),
      },
      {
        header: ({ column }) => (
          <Flex align="center" gap="2">
            End Time
            <span
              className={twcn("cursor-pointer", {
                "opacity-50": !column.getIsSorted(),
              })}
            >
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          </Flex>
        ),
        accessorKey: "endTimestamp",
        cell: ({ getValue }) => format(getValue<Date>(), "dd/MM/yyyy HH:mm:ss"),
      },
      {
        header: ({ column }) => (
          <Flex align="center" gap="2" className="cursor-pointer">
            Duration
            <span
              className={twcn("cursor-pointer", {
                "opacity-50": !column.getIsSorted(),
              })}
            >
              {column.getIsSorted() === "asc" ? "↑" : "↓"}
            </span>
          </Flex>
        ),
        accessorKey: "duration",
        cell: ({ getValue }) => {
          const value = getValue<number>();
          const minutes = Math.floor(value / 60);
          const seconds = value % 60;
          return `${minutes}m ${seconds}s`;
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data?.data.sessions || [],
    columns: userDef,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <Flex direction="column" gap="5" className="p-5 px-10">
      <Flex justify="between" wrap="wrap">
        <Flex gap="2">
          <h1 className="font-bold text-2xl">Session History</h1>
          <h3 className="font-bold text-2xl text-gray-500">
            {data?.data.sessions.length}
          </h3>
        </Flex>
        <Flex gap="2">
          <TextField.Root
            placeholder="Search for session..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          >
            <TextField.Slot>
              <Search height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Flex>
      </Flex>
      <Table.Root>
        <Table.Header className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.ColumnHeaderCell
                      colSpan={header.colSpan}
                      key={header.id}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </Table.ColumnHeaderCell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => {
            return (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
      <Flex justify="between">
        <Select.Root
          defaultValue="apple"
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(val) => {
            table.setPageSize(Number(val));
          }}
        >
          <Select.Trigger />
          <Select.Content>
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <Select.Item key={pageSize} value={pageSize.toString()}>
                {pageSize}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Flex gap="2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default History;
