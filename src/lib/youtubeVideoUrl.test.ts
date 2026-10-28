import { describe, expect, it } from "vitest";
import { isYouTubeVideoUrl } from "./youtubeVideoUrl";

describe("Player Spotlight YouTube links", () => {
  it("accepts direct YouTube videos and Shorts", () => {
    for (const url of [
      "https://youtu.be/kKFOB4YyTOY?is=WLZg0tkVul-xdQSm",
      "https://www.youtube.com/watch?v=kKFOB4YyTOY",
      "https://youtube.com/shorts/bYGatw4Ul8k?is=MBLbECweV9VHir9d",
      "https://m.youtube.com/watch?v=kKFOB4YyTOY",
      "https://www.youtube.com/live/kKFOB4YyTOY",
    ]) expect(isYouTubeVideoUrl(url)).toBe(true);
  });

  it("rejects third-party websites, spoofed hosts, and non-video pages", () => {
    for (const url of [
      "https://www.nfl.com/videos/drake-maye-highlights",
      "https://sports.yahoo.com/article",
      "https://youtube.com.evil.example/watch?v=kKFOB4YyTOY",
      "https://youtube.com@evil.example/watch?v=kKFOB4YyTOY",
      "https://www.youtube.com/results?search_query=Drake+Maye",
      "https://www.youtube.com/watch",
      "https://youtu.be/",
      "http://youtu.be/kKFOB4YyTOY",
      "javascript:alert(1)",
    ]) expect(isYouTubeVideoUrl(url)).toBe(false);
  });
});
