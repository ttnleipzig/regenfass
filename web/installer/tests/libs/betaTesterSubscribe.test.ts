import { describe, expect, it, vi, afterEach } from "vitest";
import handler from "../../../homepage/netlify/functions/beta-tester-subscribe.ts";

const request = (fields: Record<string, string>) => new Request("https://regenfass.eu/.netlify/functions/beta-tester-subscribe", {
  method: "POST",
  body: new URLSearchParams(fields),
  headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: "https://regenfass.eu" },
});

describe("beta-tester-subscribe function", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("creates a subscriber with an email fallback name and beta list", async () => {
    vi.stubEnv("LISTMONK_URL", "https://news.example");
    vi.stubEnv("LISTMONK_API_USER", "user");
    vi.stubEnv("LISTMONK_API_TOKEN", "token");
    vi.stubEnv("LISTMONK_BETA_LIST_ID", "42");
    (globalThis as typeof globalThis & { Netlify?: { env: { get: (key: string) => string | undefined } } }).Netlify = {
      env: { get: (key) => process.env[key] },
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ data: { results: [] } }), { status: 200 }));
    const response = await handler(request({ email: "ada@example.com", language: "en", name: "" }), {} as never);
    expect(response.status).toBe(200);
    const create = fetchMock.mock.calls[1]?.[1];
    expect(JSON.parse(String(create?.body))).toMatchObject({ email: "ada@example.com", name: "ada@example.com", lists: [42], preconfirm_subscriptions: false });
  });

  it("rejects invalid email and language", async () => {
    expect((await handler(request({ email: "bad", language: "en" }), {} as never)).status).toBe(400);
    expect((await handler(request({ email: "ada@example.com", language: "fr" }), {} as never)).status).toBe(400);
  });
});
