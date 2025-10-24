import {
  Badge,
  Button,
  DropdownMenu,
  Flex,
  SegmentedControl,
  Table,
  TextField,
} from "@radix-ui/themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { EllipsisVertical, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { User } from "types/types";
import { getAllUsers, userUpdatePrivilege } from "../../api/UserService";
import { useAuth } from "../../context/AuthContext";

enum AccountFilterTypes {
  ALL = "all",
  USER = "user",
  ADMIN = "admin",
}

const Users = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  });

  const updatePrivilegeMutation = useMutation({
    mutationFn: userUpdatePrivilege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const userDef = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Username",
        accessorKey: "username",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Account Type",
        accessorKey: "isAdmin",
        cell: ({ row }) =>
          row.original.isAdmin ? (
            <Badge color="green">Admin</Badge>
          ) : (
            <Badge color="blue">User</Badge>
          ),
      },
      {
        header: "Date Created",
        accessorKey: "createdAt",
        cell: ({ getValue }) => format(getValue<Date>(), "dd/MM/yyyy"),
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" className="bord">
                <EllipsisVertical />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onSelect={() =>
                  updatePrivilegeMutation.mutate({
                    userId: row.original.id,
                    isAdmin: !row.original.isAdmin,
                  })
                }
                disabled={row.original.id === user?.id}
              >
                {row.original.isAdmin ? "Remove as admin" : "Make Admin"}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ),
      },
    ],
    [updatePrivilegeMutation, user?.id],
  );

  const table = useReactTable({
    data: data?.data || [],
    columns: userDef,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="p-5 px-10">
      <Flex justify="between" className="mb-5" wrap="wrap">
        <Flex gap="2">
          <h1 className="font-bold text-2xl">Users</h1>
          <h3 className="font-bold text-2xl text-gray-500">
            {data?.data?.length}
          </h3>
        </Flex>
        <Flex gap="2">
          <TextField.Root
            placeholder="Search for user..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          >
            <TextField.Slot>
              <Search height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
          <SegmentedControl.Root
            value={
              columnFilters.find((f) => f.id === "isAdmin")?.value === true
                ? AccountFilterTypes.ADMIN
                : columnFilters.find((f) => f.id === "isAdmin")?.value === false
                  ? AccountFilterTypes.USER
                  : AccountFilterTypes.ALL
            }
            onValueChange={(value) => {
              if (value === AccountFilterTypes.ALL) {
                setColumnFilters([]);
              } else if (value === AccountFilterTypes.ADMIN) {
                setColumnFilters([{ id: "isAdmin", value: true }]);
              } else {
                setColumnFilters([{ id: "isAdmin", value: false }]);
              }
            }}
          >
            <SegmentedControl.Item value={AccountFilterTypes.ALL}>
              All
            </SegmentedControl.Item>
            <SegmentedControl.Item value={AccountFilterTypes.USER}>
              User
            </SegmentedControl.Item>
            <SegmentedControl.Item value={AccountFilterTypes.ADMIN}>
              Admin
            </SegmentedControl.Item>
          </SegmentedControl.Root>
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
    </div>
  );
};

export default Users;
