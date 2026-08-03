const monthNumbers: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

const timezoneOffsets: Record<string, string> = {
  EDT: "-04:00",
  EST: "-05:00",
  CDT: "-05:00",
  CST: "-06:00",
  MDT: "-06:00",
  MST: "-07:00",
  PDT: "-07:00",
  PST: "-08:00",
  GMT: "+00:00",
  UTC: "+00:00",
};

const monthSource = String.raw`Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?`;
const dateTimeSource = String.raw`(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?(?<month>${monthSource})\.?\s+(?<day>\d{1,2})(?:,\s*(?<year>\d{4}))?\s*(?:\/\s*)?(?<hour>\d{1,2}):(?<minute>\d{2})\s*(?<meridiem>[AP]M)\s+(?<zone>EDT|EST|CDT|CST|MDT|MST|PDT|PST|GMT|UTC)`;

type ParsedLabeledTime = {
  startsAt: string;
  localEventDate: string;
};

export interface OfficialUfcSegmentTimes {
  mainCardStartsAt: string;
  prelimsStartsAt: string;
  localEventDate: string;
}

function parseLabeledMatch(groups: Record<string, string> | undefined, now: Date): ParsedLabeledTime | null {
  if (!groups) return null;
  const month = monthNumbers[groups.month.toLowerCase()];
  const offset = timezoneOffsets[groups.zone.toUpperCase()];
  if (!month || !offset) return null;

  let year = groups.year ? Number(groups.year) : now.getUTCFullYear();
  let hour = Number(groups.hour) % 12;
  if (groups.meridiem.toUpperCase() === "PM") hour += 12;

  const localDate = () => `${year}-${month}-${groups.day.padStart(2, "0")}`;
  const candidate = () => new Date(
    `${localDate()}T${String(hour).padStart(2, "0")}:${groups.minute}:00${offset}`,
  );

  let parsed = candidate();
  if (!groups.year && parsed.getTime() < now.getTime() - 7 * 86400000) {
    year += 1;
    parsed = candidate();
  }
  if (!Number.isFinite(parsed.getTime())) return null;

  return {
    startsAt: parsed.toISOString(),
    localEventDate: localDate(),
  };
}

function labeledTimes(text: string, labelSource: string, now: Date) {
  const values = new Map<string, ParsedLabeledTime>();
  const patterns = [
    new RegExp(`${dateTimeSource}\\s*(?:\\/|[-–—|])?\\s*${labelSource}`, "giu"),
    new RegExp(`${labelSource}\\s*(?:\\/|[-–—|])?\\s*${dateTimeSource}`, "giu"),
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const parsed = parseLabeledMatch(match.groups, now);
      if (parsed) values.set(`${parsed.startsAt}|${parsed.localEventDate}`, parsed);
    }
  }

  return Array.from(values.values());
}

export function parseOfficialUfcSegmentTimes(
  visiblePageText: string,
  now = new Date(),
): OfficialUfcSegmentTimes | null {
  const mainCard = labeledTimes(visiblePageText, String.raw`Main\s*Card`, now);
  const prelims = labeledTimes(visiblePageText, String.raw`Prelims?`, now);

  if (mainCard.length !== 1 || prelims.length > 1) return null;
  const main = mainCard[0]!;
  const prelim = prelims[0];

  if (prelim) {
    if (prelim.localEventDate !== main.localEventDate) return null;
    if (Date.parse(prelim.startsAt) >= Date.parse(main.startsAt)) return null;
  }

  return {
    mainCardStartsAt: main.startsAt,
    prelimsStartsAt: prelim?.startsAt ?? "",
    localEventDate: main.localEventDate,
  };
}
