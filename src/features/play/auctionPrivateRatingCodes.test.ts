import { describe, expect, it } from "vitest";
import ratingCodeMigration from "../../../supabase/migrations/202612310059_auction_private_rating_codes.sql?raw";

describe("Auction private rating exchange codes", () => {
  it("keeps the code secret and encoder inside the private schema", () => {
    expect(ratingCodeMigration).toContain("create table private.auction_rating_code_secret");
    expect(ratingCodeMigration).toContain("create or replace function private.auction_rating_code(p_rating numeric)");
    expect(ratingCodeMigration).toContain("extensions.gen_random_bytes(32)");
    expect(ratingCodeMigration).toContain("extensions.hmac(");
    expect(ratingCodeMigration).not.toContain("create or replace function public.auction_rating_code");
  });

  it("does not grant the secret or encoder to client-facing roles", () => {
    expect(ratingCodeMigration).toContain(
      "revoke all on table private.auction_rating_code_secret from public, anon, authenticated, service_role;",
    );
    expect(ratingCodeMigration).toContain(
      "revoke all on function private.auction_rating_code(numeric) from public, anon, authenticated, service_role;",
    );
    expect(ratingCodeMigration).not.toMatch(/grant\s+select\s+on\s+private\.auction_rating_code_secret/i);
    expect(ratingCodeMigration).not.toMatch(/grant\s+execute\s+on\s+function\s+private\.auction_rating_code/i);
  });

  it("accepts only whole-number ratings in the supported domain", () => {
    expect(ratingCodeMigration).toContain("p_rating <> trunc(p_rating)");
    expect(ratingCodeMigration).toContain("p_rating < 0");
    expect(ratingCodeMigration).toContain("p_rating > 100");
    expect(ratingCodeMigration).toContain(
      "Auction rating code input must be a whole number from 0 through 100",
    );
  });

  it("returns opaque six-letter codes rather than exposing a numeric transform", () => {
    expect(ratingCodeMigration).toContain("get_byte(v_digest, 0) % 26");
    expect(ratingCodeMigration).toContain("get_byte(v_digest, 5) % 26");
    expect(ratingCodeMigration).toContain("code !~ '^[A-Z]{6}$'");
    expect(ratingCodeMigration).not.toMatch(/p_rating\s*[+*\/-]\s*\d/);
  });

  it("fails the migration if any supported rating codes collide", () => {
    expect(ratingCodeMigration).toContain("from generate_series(0, 100) as rating");
    expect(ratingCodeMigration).toContain("count(distinct code)");
    expect(ratingCodeMigration).toContain("v_distinct <> 101");
    expect(ratingCodeMigration).toContain(
      "Auction private rating code generation failed uniqueness or format validation",
    );
  });
});
