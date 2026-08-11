import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PickControlRepository } from "./pickControlRepository";

const { from, upload } = vi.hoisted(() => ({
  from: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({ storage: { from } }),
}));

import { uploadPickEventHeader } from "./pickEventHeaderUpload";

function repository(setEventHeader = vi.fn().mockResolvedValue(undefined)) {
  return {
    value: { setEventHeader } as unknown as PickControlRepository,
    setEventHeader,
  };
}

function imageFile(type = "image/webp") {
  return new File(["header"], "header.webp", { type });
}

const measureImage = vi.fn().mockResolvedValue({ width: 1600, height: 800 });

beforeEach(() => {
  from.mockReset();
  upload.mockReset();
  measureImage.mockClear();
  from.mockReturnValue({ upload });
  upload.mockResolvedValue({ data: { path: "ufc-330/event-header" }, error: null });
});

describe("Picks event header upload", () => {
  it("uploads once to the canonical bucket and persists native dimensions through the existing repository", async () => {
    const control = repository();
    const file = imageFile();

    await expect(uploadPickEventHeader({
      eventId: "ufc-330",
      file,
      repository: control.value,
      measureImage,
    })).resolves.toEqual({
      storagePath: "ufc-330/event-header",
      width: 1600,
      height: 800,
    });

    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("pick-event-headers");
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith("ufc-330/event-header", file, {
      cacheControl: "0",
      contentType: "image/webp",
      upsert: true,
    });
    expect(control.setEventHeader).toHaveBeenCalledTimes(1);
    expect(control.setEventHeader).toHaveBeenCalledWith("ufc-330", "ufc-330/event-header", 1600, 800);
  });

  it("rejects unsupported files before storage or metadata writes", async () => {
    const control = repository();

    await expect(uploadPickEventHeader({
      eventId: "ufc-330",
      file: imageFile("image/gif"),
      repository: control.value,
      measureImage,
    })).rejects.toThrow("Event header must be a JPEG, PNG, WebP, or AVIF image.");

    expect(from).not.toHaveBeenCalled();
    expect(control.setEventHeader).not.toHaveBeenCalled();
  });

  it("rejects files over 20 MB before storage or metadata writes", async () => {
    const control = repository();
    const file = imageFile();
    Object.defineProperty(file, "size", { value: 20 * 1024 * 1024 + 1 });

    await expect(uploadPickEventHeader({
      eventId: "ufc-330",
      file,
      repository: control.value,
      measureImage,
    })).rejects.toThrow("Event header must be 20 MB or smaller.");

    expect(from).not.toHaveBeenCalled();
    expect(control.setEventHeader).not.toHaveBeenCalled();
  });

  it("surfaces storage failures and does not write metadata", async () => {
    const control = repository();
    upload.mockResolvedValue({ data: null, error: { message: "storage denied" } });

    await expect(uploadPickEventHeader({
      eventId: "ufc-330",
      file: imageFile(),
      repository: control.value,
      measureImage,
    })).rejects.toThrow("storage denied");

    expect(upload).toHaveBeenCalledTimes(1);
    expect(control.setEventHeader).not.toHaveBeenCalled();
  });

  it("surfaces metadata failures without a fallback write path", async () => {
    const control = repository(vi.fn().mockRejectedValue(new Error("metadata denied")));

    await expect(uploadPickEventHeader({
      eventId: "ufc-330",
      file: imageFile(),
      repository: control.value,
      measureImage,
    })).rejects.toThrow("metadata denied");

    expect(upload).toHaveBeenCalledTimes(1);
    expect(control.setEventHeader).toHaveBeenCalledTimes(1);
  });
});
