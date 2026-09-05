import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "confirmed") {
    return <Badge className="bg-rose-100 text-rose-800">ยืนยันแล้ว</Badge>;
  }

  return <Badge className="bg-slate-100 text-slate-600">ยกเลิกแล้ว</Badge>;
}
