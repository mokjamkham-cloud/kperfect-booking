import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.NEXT_PUBLIC_API_BASE_URL = "https://kperfect-booking-api.mokjamkham.workers.dev";
process.env.NEXT_PUBLIC_SITE_URL = "https://kperfect-booking-api.mokjamkham.workers.dev";

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
