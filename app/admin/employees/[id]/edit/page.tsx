"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    status: "",
    join_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      const res = await fetch(`/api/admin/employees/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setEmployee(data.data);
      }
      setLoading(false);
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    setSaving(false);
    router.push(`/admin/employees/${id}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Employee</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" value={employee.name} onChange={handleChange} placeholder="Name" required />
        <Input name="email" value={employee.email} onChange={handleChange} placeholder="Email" required />
        <Input name="department" value={employee.department} onChange={handleChange} placeholder="Department" required />
        <Input name="position" value={employee.position} onChange={handleChange} placeholder="Position" required />
        <Input name="status" value={employee.status} onChange={handleChange} placeholder="Status" required />
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
      </form>
    </div>
  );
}