import openNextWorker from "./.open-next/worker.js";
export * from "./.open-next/worker.js";

const worker = {
  async fetch(request, env, ctx) {
    return openNextWorker.fetch(request, env, ctx);
  },

  async scheduled(_controller, env, ctx) {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://genmagang.workers.dev";
    const headers = {};
    if (env.CRON_SECRET) {
      headers["Authorization"] = `Bearer ${env.CRON_SECRET}`;
    }

    const request = new Request(`${baseUrl.replace(/\/$/, "")}/api/telegram/reminder`, {
      method: "GET",
      headers,
    });

    ctx.waitUntil(
      openNextWorker.fetch(request, env, ctx).then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error(`[Cron] Reminder failed (${res.status}):`, text);
        } else {
          console.log("[Cron] Reminder executed successfully");
        }
      })
    );
  },
};

export default worker;
