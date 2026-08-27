import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 py-12 text-center sm:px-6">
      <h1 className="text-4xl font-black text-ink">ไม่พบหน้านี้</h1>
      <p className="mt-3 leading-7 text-slate-600">ลิงก์อาจถูกย้ายหรือพิมพ์ผิด</p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-petal px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </main>
  );
}
