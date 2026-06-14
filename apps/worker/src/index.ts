/**
 * Istiqtab background worker — pg-boss.
 *
 * Sprint 0: wiring + queue registration only. The handlers are intentionally
 * stubs; real logic arrives with the features that own them:
 *   - wizard.reminders     → Sprint 2 (wizard step nudges)
 *   - booking.reminders    → Sprint 5 (expert booking confirmations/reminders)
 *   - expert.slots.cleanup → Sprint 5 (expire past unbooked slots)
 *   - ai.cost.sweep        → Sprint 5 (roll up ai_chat_messages.tokens_used)
 *
 * pg-boss creates its own `pgboss` schema in the same Postgres instance.
 */
import PgBoss from "pg-boss";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

export const QUEUES = {
  WIZARD_REMINDERS: "wizard.reminders",
  AI_COST_SWEEP: "ai.cost.sweep",
  BOOKING_REMINDERS: "booking.reminders",
  EXPERT_SLOTS_CLEANUP: "expert.slots.cleanup",
} as const;

async function main(): Promise<void> {
  const boss = new PgBoss({ connectionString });

  boss.on("error", (error) => console.error("[worker] pg-boss error", error));

  await boss.start();
  console.log("[worker] pg-boss started");

  // Register each queue, then attach a stub handler.
  for (const queue of Object.values(QUEUES)) {
    await boss.createQueue(queue);
  }

  // Stub handler factory: logs received jobs. Real logic lands per feature sprint.
  const stub =
    (queue: string) =>
    async (jobs: PgBoss.Job[]): Promise<void> => {
      for (const job of jobs) console.log(`[worker] ${queue} stub`, job.id);
    };

  await boss.work(QUEUES.WIZARD_REMINDERS, stub(QUEUES.WIZARD_REMINDERS));
  await boss.work(QUEUES.AI_COST_SWEEP, stub(QUEUES.AI_COST_SWEEP));
  await boss.work(QUEUES.BOOKING_REMINDERS, stub(QUEUES.BOOKING_REMINDERS));
  await boss.work(QUEUES.EXPERT_SLOTS_CLEANUP, stub(QUEUES.EXPERT_SLOTS_CLEANUP));

  // Recurring schedules (cron). No-ops until the handlers above are implemented.
  await boss.schedule(QUEUES.WIZARD_REMINDERS, "0 9 * * *"); // daily 09:00
  await boss.schedule(QUEUES.BOOKING_REMINDERS, "0 * * * *"); // hourly
  await boss.schedule(QUEUES.EXPERT_SLOTS_CLEANUP, "0 2 * * *"); // daily 02:00
  await boss.schedule(QUEUES.AI_COST_SWEEP, "0 1 * * *"); // daily 01:00

  console.log("[worker] queues registered:", Object.values(QUEUES).join(", "));

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[worker] ${signal} received, stopping…`);
    await boss.stop({ graceful: true });
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((error) => {
  console.error("[worker] fatal", error);
  process.exit(1);
});
