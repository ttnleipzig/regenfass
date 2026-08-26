import type { Context } from "@netlify/functions";

type Subscriber = {
  id: number;
  email: string;
  name: string;
  status: "enabled" | "blocklisted";
  attribs?: Record<string, unknown>;
  lists?: Array<{ id: number; subscription_status: string }>;
};

const allowedOrigins = new Set([
  "https://regenfass.eu",
  "https://docs.regenfass.eu",
  "https://install.regenfass.eu",
  "http://localhost:5173",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
]);

function jsonResponse(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin ?? "https://regenfass.eu",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "https://regenfass.eu",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
}

function config() {
  const url = Netlify.env.get("LISTMONK_URL");
  const user = Netlify.env.get("LISTMONK_API_USER");
  const token = Netlify.env.get("LISTMONK_API_TOKEN");
  const listId = Number(Netlify.env.get("LISTMONK_BETA_LIST_ID"));
  if (!url || !user || !token || !Number.isInteger(listId) || listId < 1) {
    throw new Error("Beta tester endpoint is not configured");
  }
  return { url: url.replace(/\/$/, ""), user, token, listId };
}

async function listmonkRequest<T>(path: string, init: RequestInit = {}) {
  const settings = config();
  const result = await fetch(`${settings.url}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`${settings.user}:${settings.token}`)}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!result.ok) throw new Error(`Listmonk returned ${result.status}`);
  return (await result.json()) as T;
}

export default async (request: Request, _context: Context) => {
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) return jsonResponse(403, { error: "Origin not allowed" }, origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (request.method !== "POST") return jsonResponse(405, { error: "Method not allowed" }, origin);

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim();
  const language = String(form.get("language") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return jsonResponse(400, { error: "Invalid email" }, origin);
  if (language !== "de" && language !== "en") return jsonResponse(400, { error: "Invalid language" }, origin);

  try {
    const settings = config();
    const query = encodeURIComponent(`subscribers.email = '${email.replace(/'/g, "''")}'`);
    const existing = await listmonkRequest<{ data: { results: Subscriber[] } }>(`/api/subscribers?query=${query}&per_page=1`);
    const subscriber = existing.data.results[0];

    if (subscriber) {
      await listmonkRequest(`/api/subscribers/${subscriber.id}`, {
        method: "PUT",
        body: JSON.stringify({
          email: subscriber.email,
          name: subscriber.name || name || email,
          status: subscriber.status,
          lists: subscriber.lists?.map((list) => list.id) ?? [],
          attribs: { ...subscriber.attribs, language },
        }),
      });
      if (!subscriber.lists?.some((list) => list.id === settings.listId)) {
        await listmonkRequest("/api/subscribers/lists", {
          method: "PUT",
          body: JSON.stringify({ ids: [subscriber.id], action: "add", target_list_ids: [settings.listId], status: "unconfirmed" }),
        });
      }
    } else {
      await listmonkRequest("/api/subscribers", {
        method: "POST",
        body: JSON.stringify({
          email,
          name: name || email,
          status: "enabled",
          lists: [settings.listId],
          attribs: { language },
          preconfirm_subscriptions: false,
        }),
      });
    }
    return jsonResponse(200, { ok: true }, origin);
  } catch (error) {
    console.error("Beta tester subscription failed", error);
    return jsonResponse(502, { error: "Subscription service unavailable" }, origin);
  }
};
