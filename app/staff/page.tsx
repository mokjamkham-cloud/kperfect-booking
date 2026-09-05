import { AdminDashboard } from "@/components/admin-dashboard";

export default function StaffPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">K Perfect Staff</p>
        <h1 className="mt-2 text-3xl font-black text-ink">จัดการคิว K Perfect Nails - Nimman</h1>
      </div>
      <AdminDashboard />
    </main>
  );
}
