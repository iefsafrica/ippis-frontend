import { notFound } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  join_date: string;
}

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/admin/employees/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  if (!data.success || !data.data) return notFound();

  const employee: Employee = data.data;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{employee.name}</h1>
      <div className="mb-2"><strong>Email:</strong> {employee.email}</div>
      <div className="mb-2"><strong>Department:</strong> {employee.department}</div>
      <div className="mb-2"><strong>Position:</strong> {employee.position}</div>
      <div className="mb-2"><strong>Status:</strong> {employee.status}</div>
      <div className="mb-2"><strong>Join Date:</strong> {new Date(employee.join_date).toLocaleDateString()}</div>
    </div>
  );
}