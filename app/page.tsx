import Link from "next/link";
import Image from "next/image";
import { CalendarDays, CheckCircle2, Clock3, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SHOP_CONFIG } from "@/lib/config";

const stats = [
  { label: "เวลาเปิด", value: `${SHOP_CONFIG.openTime} - ${SHOP_CONFIG.closeTime}` },
  { label: "ระยะเวลาต่อคิว", value: "2 ชม." },
  { label: "ออนไลน์ต่อช่วง", value: "2 ที่" },
];

export default function HomePage() {
  return (
    <main>
      <section
        className="relative min-h-[58vh] overflow-hidden border-b border-ink bg-white text-ink"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.78), rgba(255,255,255,0.2)), url('/real-beauty-talk.png')",
          backgroundPosition: "center top",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto flex min-h-[58vh] max-w-6xl flex-col justify-center gap-7 px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <Image src="/kperfect-logo.png" alt="K Perfect Nails & Spa Nimman" width={180} height={180} className="mb-5 h-24 w-24 rounded-sm border border-ink bg-white object-contain p-1" priority />
            <p className="inline-flex items-center gap-2 text-sm font-bold text-fern">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              K Perfect Nails - Nimman
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-normal sm:text-5xl">K Perfect Nails - Nimman</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-stone-700">
              จองคิวทำเล็บออนไลน์สำหรับสาขานิมมานเท่านั้น
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              จองคิว
            </Link>
            <Link
              href="/my-bookings"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-stone-100"
            >
              คิวของฉัน
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label}>
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-fern" aria-hidden="true" />
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">กติกาการจอง</h2>
              <p className="mt-2 leading-7 text-slate-600">
                จองล่วงหน้าได้ตั้งแต่วันถัดไปถึง 7 วัน ลูกค้า 1 คนมีคิวที่ยืนยันแล้วได้สูงสุด 2 คิว
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex gap-3">
            <Clock3 className="mt-1 h-5 w-5 shrink-0 text-fern" aria-hidden="true" />
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">จองวันนี้และสาขาอื่น</h2>
              <p className="mt-2 leading-7 text-slate-600">
                ระบบออนไลน์ไม่รับ same-day booking เพื่อให้หน้าร้านจัดตารางได้แม่นยำ หากต้องการจองวันนี้หรือสาขาอื่นให้ติดต่อร้าน
              </p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
