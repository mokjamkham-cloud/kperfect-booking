import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "confirmed") {
    return <Badge className="border border-ink/20 bg-white text-ink">ยืนยันแล้ว</Badge>;
  }

  return <Badge className="bg-slate-100 text-slate-600">ยกเลิกแล้ว</Badge>;
}
