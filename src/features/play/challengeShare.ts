export interface GameChallengeShare {
  title: string;
  text: string;
  url: string;
}

export async function shareGameChallenge({ title, text, url }: GameChallengeShare) {
  const payload = `${text}\n\n${url}`;
  try {
    if (navigator.share) {
      await navigator.share({ title, text: payload });
      return "CHALLENGE SENT";
    }
    await navigator.clipboard.writeText(payload);
    return "CHALLENGE LINK COPIED";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "";
    try {
      await navigator.clipboard.writeText(payload);
      return "CHALLENGE LINK COPIED";
    } catch {
      return "CHALLENGE FAILED";
    }
  }
}
