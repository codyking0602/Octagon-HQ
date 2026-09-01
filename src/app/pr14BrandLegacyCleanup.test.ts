import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const repositoryRoot = new URL("../../", import.meta.url);
const readSource = (path: string) => readFileSync(new URL(path, repositoryRoot), "utf8");
const sourceExists = (path: string) => existsSync(new URL(path, repositoryRoot));

describe("PR 14 brand and legacy cleanup contracts", () => {
  it("keeps The HQ universal brand on the approved symbol asset", () => {
    const brand = readSource("src/config/brand.ts");
    const document = readSource("index.html");
    const manifest = JSON.parse(readSource("public/app.webmanifest")) as {
      name: string;
      short_name: string;
      icons: Array<{ src: string }>;
    };
    const main = readSource("src/main.tsx");

    expect(brand).toContain('name: "The HQ"');
    expect(brand).toContain('logoUrl: "/assets/the-hq-app-icon-v2.png"');
    expect(document).toContain("<title>The HQ</title>");
    expect(document).toContain('apple-mobile-web-app-title" content="The HQ"');
    expect(document).toContain('/assets/the-hq-app-icon-v2.png');
    expect(manifest.name).toBe("The HQ");
    expect(manifest.short_name).toBe("The HQ");
    expect(manifest.icons.map((icon) => icon.src)).toEqual(["/assets/the-hq-app-icon-v2.png"]);
    expect(main).toContain('throw new Error("The HQ root element was not found.")');
  });

  it("preserves the canonical navigation, sport state, UFC-only destinations, and theme owners", () => {
    const navigation = readSource("src/components/BottomNavigation.tsx");
    const shell = readSource("src/app/AppShell.tsx");
    const providers = readSource("src/app/providers.tsx");
    const sportProvider = readSource("src/app/SportProvider.tsx");
    const tokens = readSource("src/styles/tokens.css").toLowerCase();
    const main = readSource("src/main.tsx");

    for (const label of ["Home", "Picks", "Play", "Rankings"]) {
      expect(navigation).toContain(`label: "${label}"`);
    }
    expect(navigation).not.toContain('label: "War Room"');
    expect(shell).toContain("UFC Intelligence");
    expect(shell).toContain("UFC Rankings");
    expect((providers.match(/<SportProvider>/g) ?? []).length).toBe(1);
    expect(sportProvider).toContain("the-hq:selected-sport");
    expect(tokens).toContain("#1f4e79");
    expect((main.match(/\.\/styles\/tokens\.css/g) ?? []).length).toBe(1);
  });

  it("removes War Room runtime ownership without removing current challenge or UFC Back Room owners", () => {
    const providers = readSource("src/app/providers.tsx");
    const router = readSource("src/app/router.tsx");
    const destinations = readSource("src/app/canonicalDestinations.ts");
    const notificationDestination = readSource("src/features/notifications/notificationDestination.ts");
    const main = readSource("src/main.tsx");

    expect(providers).not.toContain("WarRoomProvider");
    expect(router).not.toContain("war-room");
    expect(destinations).not.toContain('kind: "war-room"');
    expect(notificationDestination).not.toContain("/war-room");
    expect(main).not.toContain("war-room");

    expect(sourceExists("src/features/war-room/WarRoomProvider.tsx")).toBe(false);
    expect(sourceExists("src/features/war-room/WarRoomPage.tsx")).toBe(false);
    expect(sourceExists("src/features/war-room/WarRoomJoinPage.tsx")).toBe(false);
    expect(sourceExists("src/features/war-room/warRoomRepository.ts")).toBe(false);
    expect(sourceExists("src/styles/war-room.css")).toBe(false);
    expect(sourceExists("src/styles/war-room-launch.css")).toBe(false);
    expect(sourceExists("src/styles/war-room-admin-polish.css")).toBe(false);
    expect(sourceExists("src/styles/war-room-reactions.css")).toBe(false);

    expect(providers).toContain("<ChallengeProvider>");
    expect(router).toContain('path: "play"');
    expect(router).toContain('path: "back-room"');
    expect(sourceExists("src/features/challenges/ChallengeProvider.tsx")).toBe(true);
    expect(sourceExists("src/features/challenges/ChallengeCenter.tsx")).toBe(true);
  });
});
