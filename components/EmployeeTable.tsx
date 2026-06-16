"use client";

import * as React from "react";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    IconChevronLeft,
    IconDotsVertical,
    IconGripVertical,
    IconLayoutColumns,
    IconPlus,
} from "@tabler/icons-react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";



/**
 * New schema that matches your Employee entity (no createdAt / updatedAt)
 */
export const schema = z.object({
    id: z.number(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    isIntern: z.boolean().optional(),
    department: z.string().nullable().optional(),
    status: z.string().optional(),
    dateOfJoining: z.string().nullable().optional(),
    salary: z.string().nullable().optional(),
});

type RowType = z.infer<typeof schema>;

/* Drag handle component — unchanged */
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({
        id,
    });

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    );
}


function DraggableRow({ row }: { row: Row<RowType> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    });

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
        </TableRow>
    );
}

export function DataTable({ data: initialData }: { data: RowType[] }) {
    const [data, setData] = React.useState<RowType[]>(() => initialData);
    const [rowSelection, setRowSelection] = React.useState({});

    const [departments, setDepartments] = React.useState<
        { id: number; name: string }[]
    >([]);

    React.useEffect(() => {
        let cancelled = false;

        async function loadDepartments() {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/api/departments`,
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : undefined,
                    }
                );

                if (!res.ok) return;

                const data: { departments: { id: number; name: string }[] } =
                    await res.json();

                if (!cancelled) {
                    setDepartments(data.departments ?? []);
                }
            } catch {
                // silent fail
            }
        }

        loadDepartments();

        return () => {
            cancelled = true;
        };
    }, []);


    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // inside DataTable, after const [data, setData] = ...
    const columns = React.useMemo<ColumnDef<RowType>[]>(() => [
        {
            id: "drag",
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.original.id} />,
        },
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected()
                                ? true
                                : table.getIsSomePageRowsSelected()
                                    ? "indeterminate"
                                    : false
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "name",
            header: "Name",
            cell: ({ row }) => {
                const item = row.original;
                const fullName =
                    `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "Unknown";

                return (
                    <TableCellViewer
                        item={{ ...item, header: fullName }}
                        departments={departments}
                        onUpdated={(updated) => {
                            setData((prev) =>
                                prev.map((r) => (r.id === updated.id ? updated : r))
                            );
                        }}
                    />
                );
            },

            enableHiding: false,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="truncate max-w-[220px]">{row.original.email}</div>,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => row.original.phone ?? "-",
        },
        {
            accessorKey: "department",
            header: "Department",
            cell: ({ row }) => row.original.department ?? "—",
        },
        {
            id: "type",
            header: "Type",
            accessorFn: (row) => (row.isIntern ? "Intern" : "Employee"),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge variant={row.original.isIntern ? "destructive" : "outline"} className="px-2">
                        {row.original.isIntern ? "Intern" : "Employee"}
                    </Badge>
                </div>
            ),
            enableColumnFilter: true,
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => row.original.role ?? (row.original.isIntern ? "Intern" : "-"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: "dateOfJoining",
            header: "Date of Joining",
            cell: ({ row }) => (row.original.dateOfJoining ? new Date(row.original.dateOfJoining).toLocaleDateString() : "-"),
        },
        {
            accessorKey: "salary",
            header: "Salary",
            cell: ({ row }) => (row.original.salary ? `${row.original.salary}` : "-"),
        },

        // Actions column: includes Edit (Link) + Delete (confirm -> DELETE API -> remove row)
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.id;

                // delete handler inside cell so it can close over setData
                const handleDelete = async () => {
                    const confirmed = window.confirm("Are you sure you want to delete this employee? This action cannot be undone.");
                    if (!confirmed) return;

                    try {
                        const token = localStorage.getItem("token");
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/api/employees/${id}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: token ? `Bearer ${token}` : "",
                            },
                        });

                        if (!res.ok) {
                            const err = await res.json().catch(() => ({ message: "Failed to delete" }));
                            throw new Error(err.message || "Failed to delete");
                        }

                        // remove from local state
                        setData((prev) => prev.filter((r) => r.id !== id));

                        toast.success("Employee deleted");
                    } catch (err: any) {
                        console.error("Delete error:", err);
                        toast.error(err.message || "Failed to delete employee");
                    }
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
                                <IconDotsVertical />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                            <Link href={`/dashboard/employees/${id}`}>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>

                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDelete(); }} className="text-destructive">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [setData]);


    const sortableId = React.useId();
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                return arrayMove(data, oldIndex, newIndex);
            });
        }
    }

    return (
        <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6 pt-2">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">View</Label>
                <Select defaultValue="outline">
                    <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
                        <SelectValue placeholder="Select a view" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="past-performance">Past Performance</SelectItem>
                        <SelectItem value="key-personnel">Key Personnel</SelectItem>
                        <SelectItem value="focus-documents">Focus Documents</SelectItem>
                    </SelectContent>
                </Select>

                {/* --------- Filters: Role + Type (Intern/Employee) --------- */}
                <div className="flex items-center gap-2">
                    {/* Role filter */}
                    <Select
                        defaultValue="__all"
                        onValueChange={(val) => {
                            table.getColumn("role")?.setFilterValue(val === "__all" ? undefined : val);
                        }}
                    >
                        <SelectTrigger size="sm" className="w-40">
                            <SelectValue placeholder="Filter role" />
                        </SelectTrigger>
                        <SelectContent side="bottom">
                            <SelectItem value="__all">All roles</SelectItem>
                            {[...Array.from(table.getColumn("role")?.getFacetedUniqueValues().keys() || [])].map(
                                (role) => (
                                    <SelectItem key={String(role)} value={String(role)}>
                                        {String(role)}
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>

                    {/* Type / Intern filter (uses "type" column accessor) */}
                    <Select
                        defaultValue="__all"
                        onValueChange={(val) => {
                            // treat sentinel "__all" as clearing the filter
                            table.getColumn("type")?.setFilterValue(val === "__all" ? undefined : val);
                        }}
                    >
                        <SelectTrigger size="sm" className="w-36">
                            <SelectValue placeholder="Filter type" />
                        </SelectTrigger>
                        <SelectContent side="bottom">
                            <SelectItem value="__all">All</SelectItem>
                            {[...Array.from(table.getColumn("type")?.getFacetedUniqueValues().keys() || [])].map((v) => (
                                <SelectItem key={String(v)} value={String(v)}>
                                    {String(v)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* --------- end filters --------- */}

                <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
                    <TabsTrigger value="outline">Outline</TabsTrigger>
                    <TabsTrigger value="past-performance">Past Performance <Badge variant="secondary">3</Badge></TabsTrigger>
                    <TabsTrigger value="key-personnel">Key Personnel <Badge variant="secondary">2</Badge></TabsTrigger>
                    <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconLayoutColumns />
                                <span className="hidden lg:inline">Customize Columns</span>
                                <span className="lg:hidden">Columns</span>
                                <IconChevronLeft />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/dashboard/employees/new">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <IconPlus />
                            <span className="hidden lg:inline">Add Employee</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ---------- Replaced outline TabsContent: table + slim right pagination ---------- */}
            <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <div className="flex gap-4">
                    {/* Left: table area */}
                    <div className="flex-1 overflow-y-auto rounded-lg border bg-[var(--background)] h-[80vh] scrollbar-hide">
                        <DndContext
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                            sensors={sensors}
                            id={sortableId}
                        >
                            <Table>
                                <TableHeader className="bg-primary/90 text-background sticky top-0 z-10">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} colSpan={header.colSpan} className="sticky top-0 z-10 bg-primary/90 text-background">
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>

                                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                    {table.getRowModel().rows?.length ? (
                                        <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                            {table.getRowModel().rows.map((row) => (
                                                <DraggableRow key={row.id} row={row} />
                                            ))}
                                        </SortableContext>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DndContext>
                    </div>

                    {/* Right: slim vertical pagination panel (visible on lg+) */}
                    <aside
                        className="
    hidden lg:flex 
    w-16 flex-col 
    items-center 
    gap-4 
    py-4 
    px-2 
    -ml-2
    border-l 
    bg-foreground/3 
    backdrop-blur-sm 
    rounded-lg
  "
                    >
                        {/* Page size selector */}
                        <div className="flex flex-col items-center gap-1 w-full">
                            <span className="text-[10px] text-muted-foreground tracking-tight">Rows</span>

                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger
                                    size="sm"
                                    className="
          h-7 w-12 p-0 text-xs 
          bg-muted/20 hover:bg-muted/30 
          rounded-md shadow-sm
          flex items-center justify-center
        "
                                >
                                    <SelectValue
                                        placeholder={`${table.getState().pagination.pageSize}`}
                                    />
                                </SelectTrigger>
                                <SelectContent side="right" align="start">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator className="w-10" />

                        {/* Navigation buttons */}
                        <div className="flex flex-col items-center gap-3">
                            <button
                                aria-label="First page"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className="
    px-3 h-8 flex items-center justify-center 
    rounded-full border bg-muted/40 
    hover:bg-muted transition 
    text-sm shadow-md
    disabled:opacity-40 disabled:pointer-events-none
    whitespace-nowrap
  "
                                title="First"
                            >
                                {"<<"}
                            </button>


                            <button
                                aria-label="Previous page"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="
        w-8 h-8 flex items-center justify-center 
        rounded-full border bg-muted/40 
        hover:bg-muted transition 
        text-sm shadow-md
        disabled:opacity-40 disabled:pointer-events-none
      "
                                title="Previous"
                            >
                                {"<"}
                            </button>

                            {/* Current page number */}
                            <div
                                className="
        w-9 h-9 flex items-center justify-center 
        text-md font-semibold 
        bg-primary text-primary-foreground 
        rounded-full shadow-md
      "
                            >
                                {table.getState().pagination.pageIndex + 1}
                            </div>

                            <button
                                aria-label="Next page"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="
        w-8 h-8 flex items-center justify-center 
        rounded-full border bg-muted/40 
        hover:bg-muted transition 
        text-sm shadow-md
        disabled:opacity-40 disabled:pointer-events-none
      "
                                title="Next"
                            >
                                {">"}
                            </button>

                            {/* Last button shows total pages next to arrows */}
                            <div className="group relative">
                                <button
                                    aria-label="Last page"
                                    onClick={() =>
                                        table.setPageIndex(Math.max(0, table.getPageCount() - 1))
                                    }
                                    disabled={!table.getCanNextPage()}
                                    className="
    px-3 h-8 flex items-center justify-center 
    rounded-full border bg-muted/40 
    hover:bg-muted transition 
    text-sm shadow-md
    disabled:opacity-40 disabled:pointer-events-none
    whitespace-nowrap
  "
                                >
                                    {/* Default >> */}
                                    <span className="transition-opacity group-hover:opacity-0">
                                        {">>"}
                                    </span>

                                    {/* Page count on hover */}
                                    <span className="absolute inset-0 flex items-center justify-center text-[15px] opacity-0 group-hover:opacity-100 transition-opacity">
                                        {table.getPageCount()}
                                    </span>
                                </button>
                            </div>


                        </div>
                    </aside>


                </div>

                {/* keep a minimal horizontal footer for small screens (visible under lg) */}
                <div className="flex items-center justify-between px-4 lg:hidden">
                    <div className="text-muted-foreground text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} selected
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            aria-label="Previous"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-muted bg-background text-sm disabled:opacity-50"
                        >
                            {"<"}
                        </button>

                        <div className="text-sm font-medium">{table.getState().pagination.pageIndex + 1}</div>

                        <button
                            aria-label="Next"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-muted bg-background text-sm disabled:opacity-50"
                        >
                            {">"}
                        </button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="past-performance" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>

            <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>

            <TabsContent value="focus-documents" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs>

    );
}

/* TableCellViewer: Drawer shows full employee details and editing inputs */
function TableCellViewer({
    item,
    departments,
    onUpdated,
}: {
    item: RowType & { header?: string };
    departments: { id: number; name: string }[];
    onUpdated: (row: RowType) => void;
}) {

    const isMobile = useIsMobile();

    // local state for editing inside the drawer (optimistic local edits)
    const [local, setLocal] = React.useState({
        firstName: item.firstName ?? "",
        lastName: item.lastName ?? "",
        email: item.email ?? "",
        phone: item.phone ?? "",
        role: item.role ?? "",
        department: item.department ?? "",
        status: item.status ?? "",
        dateOfJoining: item.dateOfJoining ?? "",
        salary: item.salary ?? "",
        isIntern: !!item.isIntern,
    });

    const [departmentId, setDepartmentId] = React.useState<string>("");

    React.useEffect(() => {
        setLocal({
            firstName: item.firstName ?? "",
            lastName: item.lastName ?? "",
            email: item.email ?? "",
            phone: item.phone ?? "",
            role: item.role ?? "",
            department: item.department ?? "",
            status: item.status ?? "",
            dateOfJoining: item.dateOfJoining ?? "",
            salary: item.salary ?? "",
            isIntern: !!item.isIntern,
        });
    }, [item]);

    React.useEffect(() => {
        if (!departments.length) return;

        if (item.department) {
            const match = departments.find(
                (d) => d.name === item.department
            );

            if (match) {
                setDepartmentId(String(match.id));
            } else {
                setDepartmentId("");
            }
        } else {
            setDepartmentId("");
        }
    }, [item.department, departments]);

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground w-fit px-0 text-left">
                    {(item.header ?? `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()) || "Unknown"}
                </Button>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>{(item.header ?? `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()) || "Unknown"}</DrawerTitle>
                </DrawerHeader>

                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <form className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`first-${item.id}`}>First name</Label>
                                <Input id={`first-${item.id}`} value={local.firstName} onChange={(e) => setLocal(s => ({ ...s, firstName: e.target.value }))} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`last-${item.id}`}>Last name</Label>
                                <Input id={`last-${item.id}`} value={local.lastName} onChange={(e) => setLocal(s => ({ ...s, lastName: e.target.value }))} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`email-${item.id}`}>Email</Label>
                                <Input id={`email-${item.id}`} value={local.email} onChange={(e) => setLocal(s => ({ ...s, email: e.target.value }))} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`phone-${item.id}`}>Phone</Label>
                                <Input id={`phone-${item.id}`} value={local.phone} onChange={(e) => setLocal(s => ({ ...s, phone: e.target.value }))} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`role-${item.id}`}>Role</Label>
                                <Input id={`role-${item.id}`} value={local.role} onChange={(e) => setLocal(s => ({ ...s, role: e.target.value }))} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`dept-${item.id}`}>Department</Label>

                                <Select
                                    value={departmentId || "__none__"}
                                    onValueChange={(val) =>
                                        setDepartmentId(val === "__none__" ? "" : val)
                                    }
                                >
                                    <SelectTrigger id={`dept-${item.id}`} className="w-full">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="__none__">No department</SelectItem>

                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`status-${item.id}`}>Status</Label>
                                <Select defaultValue={local.status ?? ""} onValueChange={(val) => setLocal(s => ({ ...s, status: val }))}>
                                    <SelectTrigger id={`status-${item.id}`} className="w-full">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                        <SelectItem value="PENDING">PENDING</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`doj-${item.id}`}>Date of Joining</Label>
                                <Input id={`doj-${item.id}`} value={local.dateOfJoining ?? ""} onChange={(e) => setLocal(s => ({ ...s, dateOfJoining: e.target.value }))} placeholder="YYYY-MM-DD" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`salary-${item.id}`}>Salary</Label>
                                <Input id={`salary-${item.id}`} value={local.salary ?? ""} onChange={(e) => setLocal(s => ({ ...s, salary: e.target.value }))} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`intern-${item.id}`}>Is intern</Label>
                                <Select defaultValue={String(local.isIntern)} onValueChange={(val) => setLocal(s => ({ ...s, isIntern: val === "true" }))}>
                                    <SelectTrigger id={`intern-${item.id}`} className="w-full">
                                        <SelectValue placeholder={String(local.isIntern)} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">No</SelectItem>
                                        <SelectItem value="true">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                </div>

                <DrawerFooter>
                    <Button
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem("token");
                                if (!token) {
                                    toast.error("Not authenticated");
                                    return;
                                }

                                const body = {
                                    firstName: local.firstName,
                                    lastName: local.lastName,
                                    email: local.email,
                                    phone: local.phone || null,
                                    role: local.role || null,
                                    status: local.status,
                                    dateOfJoining: local.dateOfJoining || null,
                                    salary: local.salary || null,
                                    isIntern: local.isIntern,
                                    departmentId: departmentId ? Number(departmentId) : null,
                                };

                                const res = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/api/employees/${item.id}`,
                                    {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify(body),
                                    }
                                );

                                const data: { message?: string } = await res.json().catch(() => ({}));

                                if (!res.ok) {
                                    throw new Error(data.message || "Failed to update employee");
                                }

                                toast.success("Employee updated");

                                onUpdated({
                                    ...item,
                                    firstName: local.firstName,
                                    lastName: local.lastName,
                                    email: local.email,
                                    phone: local.phone || null,
                                    role: local.role || null,
                                    status: local.status,
                                    dateOfJoining: local.dateOfJoining || null,
                                    salary: local.salary || null,
                                    isIntern: local.isIntern,
                                    department:
                                        departments.find((d) => String(d.id) === departmentId)?.name ?? null,
                                });

                            } catch (err) {
                                const message =
                                    err instanceof Error ? err.message : "Failed to update employee";
                                toast.error(message);
                            }
                        }}
                    >
                        Save
                    </Button>

                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
