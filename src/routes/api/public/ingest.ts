import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { runIngestion } from "@/lib/ingest.server";

export const Route = createFileRoute("/api/public/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        try {
          return Response.json(await runIngestion());
        } catch (e) {
          return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
        }
      },
    },
  },
});
