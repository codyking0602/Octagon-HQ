import { describe, expect, it } from "vitest";
import { readFunctionErrorMessage } from "./identityGateway";

describe("PIN function error handling", () => {
  it("surfaces the Edge Function response body instead of the generic SDK message", async () => {
    const error = {
      message: "Edge Function returned a non-2xx status code",
      context: new Response(JSON.stringify({ message: "That name and PIN did not match." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };

    await expect(readFunctionErrorMessage(error)).resolves.toBe("That name and PIN did not match.");
  });

  it("keeps the platform error code when the function body is unavailable", async () => {
    const error = {
      message: "Edge Function returned a non-2xx status code",
      context: new Response("not-json", {
        status: 500,
        headers: { "sb-error-code": "EDGE_FUNCTION_ERROR" },
      }),
    };

    await expect(readFunctionErrorMessage(error)).resolves.toBe("Profile service error (EDGE_FUNCTION_ERROR).");
  });
});
