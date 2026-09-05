import Link from "next/link";
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
        className="relative min-h-[58vh] overflow-hidden bg-ink text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(31,23,21,0.9), rgba(88,55,47,0.58), rgba(239,127,154,0.22)), url('https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto flex min-h-[58vh] max-w-6xl flex-col justify-center gap-7 px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-rose-100">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              K Perfect Nails - Nimman
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">K Perfect Nails - Nimman</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-100">
              จองคิวทำเล็บออนไลน์สำหรับสาขานิมมานแบบง่าย ๆ สาขาอื่นกรุณาโทรจองผ่านช่องทางร้าน
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-petal px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              จองคิว
            </Link>
            <Link
              href="/my-bookings"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-petal hover:text-petal"
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
            <p className="mt-2 text-2xl font-black text-ink">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-fern" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-ink">กติกาการจอง</h2>
              <p className="mt-2 leading-7 text-slate-600">
                จองล่วงหน้าได้ตั้งแต่วันถัดไปถึง 7 วัน ลูกค้า 1 คนมีคิวที่ยืนยันแล้วได้สูงสุด 2 คิว
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex gap-3">
            <Clock3 className="mt-1 h-5 w-5 shrink-0 text-petal" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-ink">จองวันนี้และสาขาอื่น</h2>
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
