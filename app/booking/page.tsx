import { BookingForm } from "@/components/booking-form";

export default function BookingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">Online Booking</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink">K Perfect Nails - Nimman</h1>
        <p className="mt-2 text-sm text-slate-600">จองคิวทำเล็บออนไลน์สำหรับสาขานิมมานเท่านั้น</p>
      </div>
      <BookingForm />
    </main>
  );
}
