import { describe, expect, it } from "vitest";
import {
  mergeWarRoomMessages,
  mentionedMemberIds,
  type WarRoomMember,
  type WarRoomMessage,
} from "./warRoomModel";

const cody: WarRoomMember = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "C",
  avatarPhotoData: null,
};

const codyKing: WarRoomMember = {
  id: "22222222-2222-4222-8222-222222222222",
  displayName: "CODY KING",
  initials: "CK",
  avatarPhotoData: null,
};

function message(id: string, createdAt: string, body: string): WarRoomMessage {
  return {
    id,
    body,
    deleted: false,
    createdAt,
    author: cody,
    parent: null,
    mentions: [],
    reactions: [],
    canDelete: true,
  };
}

describe("War Room model", () => {
  it("merges older and newer pages once in chronological order", () => {
    const current = [message("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "2026-07-29T12:00:00Z", "SECOND")];
    const incoming = [
      message("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "2026-07-29T11:00:00Z", "FIRST"),
      message("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "2026-07-29T12:00:00Z", "UPDATED"),
    ];

    const merged = mergeWarRoomMessages(current, incoming);
    expect(merged.map((row) => row.body)).toEqual(["FIRST", "UPDATED"]);
  });

  it("resolves exact member mentions without matching embedded names", () => {
    expect(mentionedMemberIds("HEY @CODY KING, YOUR PICK?", [cody, codyKing]))
      .toEqual([codyKing.id]);
    expect(mentionedMemberIds("EMAILCODY@CODY.COM", [cody])).toEqual([]);
    expect(mentionedMemberIds("@CODY!", [cody])).toEqual([cody.id]);
  });
});
