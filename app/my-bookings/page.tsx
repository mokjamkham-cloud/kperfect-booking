import { BookingList } from "@/components/booking-list";

export default function MyBookingsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">My Queue</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink">คิวของฉัน</h1>
      </div>
      <BookingList />
    </main>
  );
}
