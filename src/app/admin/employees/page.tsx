"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { employees as initialEmployees } from "@/lib/mock-data";
import { Employee, Role } from "@/types";

const roleColors: Record<Role, string> = {
    admin: "bg-violet-500",
    chef: "bg-orange-500",
    waiter: "bg-blue-500",
    cashier: "bg-emerald-500",
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "waiter" as Role,
    });
    const [filterRole, setFilterRole] = useState<Role | "all">("all");

    const filteredEmployees =
        filterRole === "all"
            ? employees
            : employees.filter((emp) => emp.role === filterRole);

    const handleOpenDialog = (employee?: Employee) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                name: employee.name,
                email: employee.email,
                phone: employee.phone || "",
                role: employee.role,
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                name: "",
                email: "",
                phone: "",
                role: "waiter",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (editingEmployee) {
            // Update existing employee
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === editingEmployee.id
                        ? { ...emp, ...formData }
                        : emp
                )
            );
        } else {
            // Add new employee
            const newEmployee: Employee = {
                id: `emp-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                hireDate: new Date(),
                isActive: true,
            };
            setEmployees((prev) => [...prev, newEmployee]);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (employeeId: string) => {
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    };

    const roleCounts = {
        admin: employees.filter((e) => e.role === "admin").length,
        chef: employees.filter((e) => e.role === "chef").length,
        waiter: employees.filter((e) => e.role === "waiter").length,
        cashier: employees.filter((e) => e.role === "cashier").length,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Employees
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your restaurant staff
                    </p>
                </div>
                <div className="flex gap-3">
                    <Select
                        value={filterRole}
                        onValueChange={(v) => setFilterRole(v as Role | "all")}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="chef">Chef</SelectItem>
                            <SelectItem value="waiter">Waiter</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" x2="19" y1="8" y2="14" />
                            <line x1="22" x2="16" y1="11" y2="11" />
                        </svg>
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Role Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-violet-500/20 bg-violet-500/5">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                            {roleCounts.admin}
                        </div>
                        <div className="text-sm text-muted-foreground">Admins</div>
                    </CardContent>
                </Card>
                <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {roleCounts.chef}
                        </div>
                        <div className="text-sm text-muted-foreground">Chefs</div>
                    </CardContent>
                </Card>
                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {roleCounts.waiter}
                        </div>
                        <div className="text-sm text-muted-foreground">Waiters</div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {roleCounts.cashier}
                        </div>
                        <div className="text-sm text-muted-foreground">Cashiers</div>
                    </CardContent>
                </Card>
            </div>

            {/* Employee List */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Members ({filteredEmployees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredEmployees.map((employee) => (
                            <div
                                key={employee.id}
                                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={employee.avatar} alt={employee.name} />
                                    <AvatarFallback>
                                        {employee.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{employee.name}</p>
                                        <Badge
                                            className={`${roleColors[employee.role]} text-white text-xs`}
                                        >
                                            {employee.role}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {employee.email}
                                    </p>
                                </div>
                                <div className="hidden md:block text-sm text-muted-foreground">
                                    {employee.phone}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenDialog(employee)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(employee.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingEmployee ? "Edit Employee" : "Add New Employee"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingEmployee
                                ? "Update employee information"
                                : "Enter the details for the new employee"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Enter name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="Enter email"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Phone</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Role</label>
                            <Select
                                value={formData.role}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, role: v as Role })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="chef">Chef</SelectItem>
                                    <SelectItem value="waiter">Waiter</SelectItem>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                        >
                            {editingEmployee ? "Save Changes" : "Add Employee"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
