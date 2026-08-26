import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { BetaTester, LocaleProvider } from "@regenfass/brand";

describe("BetaTester", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("requires email and keeps name optional", () => {
    const { container } = render(() => <BetaTester />);
    expect(container.querySelector('input[name="email"]')).toBeRequired();
    expect(container.querySelector('input[name="name"]')).not.toBeRequired();
    expect(container.querySelector("#beta-testers")).toBeInTheDocument();
  });

  it("submits email, optional name, and locale", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    render(() => <LocaleProvider initialLocale="de"><BetaTester endpoint="https://example.test/beta" /></LocaleProvider>);
    const form = document.querySelector("#form-beta-tester") as HTMLFormElement;
    (form.elements.namedItem("name") as HTMLInputElement).value = "Ada Lovelace";
    (form.elements.namedItem("email") as HTMLInputElement).value = "ada@example.com";
    await fireEvent.submit(form);
    const body = fetchMock.mock.calls[0]?.[1]?.body as FormData;
    expect(body.get("name")).toBe("Ada Lovelace");
    expect(body.get("email")).toBe("ada@example.com");
    expect(body.get("language")).toBe("de");
    expect(body.get("list")).toBe("beta-de");
    expect(await screen.findByRole("status")).toHaveTextContent("Fast fertig");
    expect((form.elements.namedItem("email") as HTMLInputElement).value).toBe("");
  });

  it("shows an error when the subscription fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(() => <BetaTester />);
    const form = document.querySelector("#form-beta-tester") as HTMLFormElement;
    (form.elements.namedItem("email") as HTMLInputElement).value = "ada@example.com";
    await fireEvent.submit(form);
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't complete");
  });
});
