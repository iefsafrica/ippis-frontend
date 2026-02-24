"use client";

import ClientWrapper from "./client-wrapper"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { addEmployee } from "@/services/endpoints/employees/employees";
import { get } from "@/services/axios";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { AxiosError } from "axios";

export default function PendingEmployeesPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "Finance",
    position: "",
    status: "pending",
  });

  //  state for your pending employees list
  const [pendingEmployees, setPendingEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (searchParams.get("add") === "1") setShowAddDialog(true);
  }, [searchParams]);

  // Fetch pending employee
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data: any = await get("/admin/employees", { status: "pending" });
        if (data && data.success) setPendingEmployees(data.data.employees);
      } catch (err) {
        console.error("Failed to fetch pending employees:", err);
      }
    };
    fetchPending();
  }, [showAddDialog, isSubmitting]);

  // Approve handler
  const handleApprove = async (employeeId: string) => {
    await fetch(`/api/admin/employees/${employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    // Refresh pending list
    setPendingEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    // Optionally show a toast or alert
    alert("Employee approved and moved to employee list!");
  };

  const handleAddEmployee = async () => {
    const trimmedName = newEmployee.name.trim();
    const trimmedEmail = newEmployee.email.trim();
    const trimmedDepartment = newEmployee.department.trim();
    const trimmedPosition = newEmployee.position.trim();

    if (!trimmedName || !trimmedEmail || !trimmedDepartment || !trimmedPosition) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const nameParts = trimmedName.split(/\s+/).filter(Boolean);

    const getApiErrorMessage = (
      error: unknown,
      fallback: string
    ) => {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return (
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        (axiosError.message === "Network Error"
          ? "Unable to reach the server. Please check your connection and try again."
          : axiosError.message) ||
        fallback
      );
    };

    setIsSubmitting(true);
    try {
      const [firstname, ...rest] = nameParts;
      const surname = rest.join(" ") || "N/A";

      const payload = {
        surname,
        firstname: firstname || "",
        email: trimmedEmail,
        department: trimmedDepartment,
        position: trimmedPosition,
        status: newEmployee.status,
      };
      //@ts-expect-error - addEmployee returns a generic response, we need to check success manually
      const result: any = await addEmployee(payload);
      if (!result || !result.success) {
        const message =
          result?.error ||
          result?.message ||
          "Failed to add employee. Please try again.";
        toast({
          title: "Unable to add employee",
          description: message,
          variant: "destructive",
        });
        return;
      }

      setShowAddDialog(false);
      setNewEmployee({
        name: "",
        email: "",
        department: "Finance",
        position: "",
        status: "pending",
      });

      toast({
        title: "Employee added",
        description: "Employee was added successfully.",
        variant: "success",
      });
      setListRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast({
        title: "Unable to add employee",
        description: getApiErrorMessage(error, "Failed to add employee. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details of the new employee. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={newEmployee.department}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, department: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, position: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Input
                id="status"
                value={newEmployee.status}
                disabled
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEmployee}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <div className="px-2 sm:px-4 lg:px-6">
        <ClientWrapper refreshKey={listRefreshKey} />
      </div>
    </>
  )
}
