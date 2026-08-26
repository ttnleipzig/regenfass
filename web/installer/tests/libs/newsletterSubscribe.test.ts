import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../../homepage/netlify/functions/newsletter-subscribe.ts";

const event = (body: string) =>
	new Request("https://regenfass.eu/.netlify/functions/newsletter-subscribe", {
		method: "POST",
		headers: {
			Origin: "http://localhost:5173",
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});

describe("newsletter-subscribe function", () => {
	beforeEach(() => {
		vi.stubGlobal("Netlify", {
			env: { get: (key: string) => process.env[key] },
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it("stores the selected language for a new subscriber", async () => {
		vi.stubEnv("LISTMONK_URL", "https://news.regenfass.eu");
		vi.stubEnv("LISTMONK_API_USER", "api-user");
		vi.stubEnv("LISTMONK_API_TOKEN", "api-token");
		vi.stubEnv("LISTMONK_NEWS_LIST_ID", "7");
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ data: { results: [] } }), { status: 200 }),
			)
			.mockResolvedValueOnce(new Response(JSON.stringify({ data: true }), { status: 200 }));

		const result = await handler(event("email=person%40example.com&language=en"), {} as never);

		expect(result.status).toBe(200);
		const [, request] = fetchMock.mock.calls[1] ?? [];
		expect(JSON.parse(String(request?.body))).toMatchObject({
			email: "person@example.com",
			lists: [7],
			attribs: { language: "en" },
			preconfirm_subscriptions: false,
		});
	});

	it("merges the language onto an existing subscriber", async () => {
		vi.stubEnv("LISTMONK_URL", "https://news.regenfass.eu");
		vi.stubEnv("LISTMONK_API_USER", "api-user");
		vi.stubEnv("LISTMONK_API_TOKEN", "api-token");
		vi.stubEnv("LISTMONK_NEWS_LIST_ID", "7");
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ data: { results: [{ id: 12, lists: [{ id: 7, subscription_status: "confirmed" }] }] } }), { status: 200 }),
			)
			.mockResolvedValueOnce(new Response(JSON.stringify({ data: true }), { status: 200 }));

		const result = await handler(event("email=person%40example.com&language=de"), {} as never);

		expect(result.status).toBe(200);
		expect(fetchMock.mock.calls[1]?.[0]).toBe("https://news.regenfass.eu/api/subscribers/12");
		expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
			attribs: { language: "de" },
		});
	});

	it("rejects unsupported languages before calling Listmonk", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch");
		const result = await handler(event("email=person%40example.com&language=fr"), {} as never);

		expect(result.status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
