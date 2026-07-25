import { describe, expect, it, vi } from "vitest";
import { requestPinAuth } from "./identityGateway";

const config = {
  url: "https://octagonproject.supabase.co",
  publishableKey: "sb_publishable_test",
};

describe("PIN authentication transport", () => {
  it("posts directly to the Edge Function with the public project key", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(
      JSON.stringify({ tokenHash: "token-123" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    ));

    await expect(requestPinAuth(config, "login", "CODY", "1234", fetcher)).resolves.toBe("token-123");
    expect(fetcher).toHaveBeenCalledOnce();

    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://octagonproject.supabase.co/functions/v1/pin-auth");
    expect(init).toMatchObject({
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "login", displayName: "CODY", pin: "1234" }),
    });
  });

  it("surfaces the Edge Function response instead of the Supabase SDK wrapper message", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(
      JSON.stringify({ message: "That name and PIN did not match." }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    ));

    await expect(requestPinAuth(config, "login", "CODY", "0000", fetcher))
      .rejects.toThrow("That name and PIN did not match.");
  });

  it("keeps the platform error code when the response body is unavailable", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response("not-json", {
      status: 500,
      headers: { "sb-error-code": "EDGE_FUNCTION_ERROR" },
    }));

    await expect(requestPinAuth(config, "login", "CODY", "1234", fetcher))
      .rejects.toThrow("Profile service error (EDGE_FUNCTION_ERROR).");
  });

  it("does not use the Supabase Functions SDK or a Cloudflare proxy for PIN login", async () => {
    const source = await import("./identityGateway.ts?raw");
    expect(source.default).not.toContain("functions.invoke");
    expect(source.default).not.toContain("/api/supabase/");
    expect(source.default).toContain("requestPinAuth(browserConfig, action, displayName, pin)");
  });
});
