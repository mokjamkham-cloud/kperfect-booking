import { BookingForm } from "@/components/booking-form";

export default function BookingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">Online Booking</p>
        <h1 className="mt-2 text-3xl font-black text-ink">จองคิวทำเล็บ</h1>
      </div>
      <BookingForm />
    </main>
  );
}
