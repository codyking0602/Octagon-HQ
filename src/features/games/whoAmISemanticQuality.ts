import type { WhoAmIClue, WhoAmILeague } from "./whoAmIEngine";

export type WhoAmIEditorialIssueCode =
  | "malformed-first-person"
  | "zero-value-production"
  | "stage-leakage";

export interface WhoAmIEditorialIssue {
  code: WhoAmIEditorialIssueCode;
  message: string;
}

const NORMALIZED_COPY_CACHE = new WeakMap<WhoAmIClue, string>();
const INFORMATION_KEYS_CACHE = new WeakMap<WhoAmIClue, readonly string[]>();
const SHARE_INFORMATION_CACHE = new WeakMap<WhoAmIClue, WeakMap<WhoAmIClue, boolean>>();
const SEMANTIC_CAPACITY_CACHE = new WeakMap<readonly WhoAmIClue[], Map<number, number>>();

export function normalizeWhoAmICopy(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function keyPart(value: string) {
  return normalizeWhoAmICopy(value).replace(/\s+/g, "-");
}

function normalizedRole(value: string) {
  const role = normalizeWhoAmICopy(value)
    .replace(/^(?:a|an|the)\s+/, "")
    .replace(/\s+(?:in college|in the nfl)$/, "")
    .trim();

  const aliases: Readonly<Record<string, string>> = {
    quarterback: "qb",
    qb: "qb",
    "running back": "rb",
    rb: "rb",
    "wide receiver": "wr",
    receiver: "wr",
    wr: "wr",
    "tight end": "te",
    te: "te",
    linebacker: "lb",
    lb: "lb",
    "defensive back": "db",
    db: "db",
    cornerback: "cb",
    cb: "cb",
    safety: "s",
    "defensive lineman": "dl",
    "defensive line": "dl",
    dl: "dl",
    "offensive lineman": "ol",
    "offensive line": "ol",
    ol: "ol",
    punter: "p",
    kicker: "k",
  };
  return aliases[role] ?? (role.length <= 28 ? role : null);
}

const AWARD_KEYS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bheisman\b/i, "award:heisman"],
  [/\bbednarik\b/i, "award:bednarik"],
  [/\bbutkus\b/i, "award:butkus"],
  [/\bnagurski\b/i, "award:nagurski"],
  [/\boutland\b/i, "award:outland"],
  [/\blombardi award\b/i, "award:lombardi"],
  [/\bmaxwell\b/i, "award:maxwell"],
  [/\bwalter camp\b/i, "award:walter-camp"],
  [/\bdoak walker\b/i, "award:doak-walker"],
  [/\bbiletnikoff\b/i, "award:biletnikoff"],
  [/\bmackey award\b/i, "award:mackey"],
  [/\brimington\b/i, "award:rimington"],
  [/\bdavey o(?:'|’)brien\b/i, "award:davey-obrien"],
  [/\bthorpe award\b/i, "award:thorpe"],
  [/\bdefensive player of the year\b/i, "award:defensive-player-of-the-year"],
  [/\boffensive player of the year\b/i, "award:offensive-player-of-the-year"],
  [/\bmost valuable player\b|\bmvp\b/i, "award:mvp"],
  [/\ball[- ]america(?:n)?\b/i, "award:all-america"],
  [/\ball[- ]pro\b/i, "award:all-pro"],
  [/\bpro[- ]bowl\b/i, "award:pro-bowl"],
];

const NUMBER_METRICS: ReadonlyArray<readonly [RegExp, string]> = [
  [/interceptions?/, "interceptions"],
  [/pass breakups?/, "pass-breakups"],
  [/sacks?/, "sacks"],
  [/tackles?/, "tackles"],
  [/rushing touchdowns?/, "rushing-touchdowns"],
  [/receiving touchdowns?/, "receiving-touchdowns"],
  [/passing touchdowns?/, "passing-touchdowns"],
  [/touchdowns?/, "touchdowns"],
  [/rushing yards?/, "rushing-yards"],
  [/receiving yards?/, "receiving-yards"],
  [/passing yards?/, "passing-yards"],
  [/scrimmage yards?/, "scrimmage-yards"],
  [/receptions?/, "receptions"],
  [/attempts?/, "attempts"],
  [/title fights?/, "title-fights"],
  [/title wins?/, "title-wins"],
  [/submission wins?/, "submission-wins"],
  [/submissions?/, "submissions"],
  [/knockout wins?/, "knockout-wins"],
  [/knockouts?/, "knockouts"],
  [/ufc wins?/, "ufc-wins"],
  [/career wins?/, "career-wins"],
];

function numericMetricKeys(text: string) {
  const normalized = normalizeWhoAmICopy(text);
  const keys = new Set<string>();

  const titleWins = normalized.match(/\b(?:won|earned)\s+(\d+)\s+(?:ufc\s+)?title fights?\b/i);
  if (titleWins?.[1]) keys.add(`stat:title-wins:${titleWins[1]}`);

  const titleFights = normalized.match(/\b(?:competed in|had)\s+(\d+)\s+(?:ufc\s+)?title fights?\b/i);
  if (titleFights?.[1]) keys.add(`stat:title-fights:${titleFights[1]}`);

  for (const [metricPattern, metric] of NUMBER_METRICS) {
    if (metric === "title-fights" && titleWins) continue;
    const source = metricPattern.source;
    const afterNumber = normalized.match(new RegExp(`\\b(\\d+(?: \\d+)?)\\s+(?:career\\s+)?(?:nfl\\s+|ufc\\s+|college\\s+)?${source}\\b`, "i"));
    const beforeNumber = normalized.match(new RegExp(`\\b${source}\\b[^0-9]{0,24}(\\d+(?: \\d+)?)\\b`, "i"));
    const number = afterNumber?.[1] ?? beforeNumber?.[1];
    if (number) keys.add(`stat:${metric}:${number.replace(/\s+/g, "")}`);
  }

  return keys;
}

function structuralKeys(clue: WhoAmIClue) {
  const keys = new Set<string>();
  const text = clue.text.trim().replace(/[.!?]+$/, "");

  const schoolOnly = text.match(/^I played college football at (.+)$/i);
  if (schoolOnly) keys.add(`school:${keyPart(schoolOnly[1]!) }`);

  const schoolRole = text.match(/^At (.+), I played (.+)$/i);
  if (schoolRole) {
    const school = keyPart(schoolRole[1]!);
    const role = normalizedRole(schoolRole[2]!);
    if (school) keys.add(`school:${school}`);
    if (role) keys.add(`role:${role}`);
  }

  const roleOnly = text.match(/^I played (.+)$/i);
  if (roleOnly && !/college football at/i.test(roleOnly[1]!)) {
    const role = normalizedRole(roleOnly[1]!);
    if (role) keys.add(`role:${role}`);
  }

  const concept = `${clue.conceptId ?? ""} ${clue.id}`.toLowerCase();
  if (/\brole-school\b/.test(concept) && schoolRole) {
    keys.add(`school-role:${keyPart(schoolRole[1]!)}:${normalizedRole(schoolRole[2]!) ?? keyPart(schoolRole[2]!)}`);
  }

  return keys;
}

export function whoAmIClueInformationKeys(clue: WhoAmIClue) {
  const cached = INFORMATION_KEYS_CACHE.get(clue);
  if (cached) return cached;

  const keys = new Set<string>(clue.informationKeys?.filter(Boolean) ?? []);
  const haystack = `${clue.conceptId ?? ""} ${clue.id} ${clue.text}`;

  for (const key of structuralKeys(clue)) keys.add(key);
  for (const [pattern, key] of AWARD_KEYS) {
    if (pattern.test(haystack)) keys.add(key);
  }
  for (const key of numericMetricKeys(clue.text)) keys.add(key);

  if (/\bnational championship\b|\bnational title\b/i.test(haystack)) keys.add("title:national-championship");
  if (/\bsuper bowl\b/i.test(haystack)) keys.add("title:super-bowl");
  if (/\bdraft(?:ed)?\b|\bselected\b.*\boverall\b/i.test(haystack)) keys.add("career:draft-selection");

  const result = [...keys].map((key) => key.trim()).filter(Boolean);
  INFORMATION_KEYS_CACHE.set(clue, result);
  return result;
}

function normalizedClueCopy(clue: WhoAmIClue) {
  const cached = NORMALIZED_COPY_CACHE.get(clue);
  if (cached) return cached;
  const normalized = normalizeWhoAmICopy(clue.text);
  NORMALIZED_COPY_CACHE.set(clue, normalized);
  return normalized;
}

export function whoAmICluesShareInformation(left: WhoAmIClue, right: WhoAmIClue) {
  if (left === right) return true;

  const cached = SHARE_INFORMATION_CACHE.get(left)?.get(right);
  if (cached != null) return cached;

  let result = normalizedClueCopy(left) === normalizedClueCopy(right);
  if (!result) {
    const leftKeys = new Set(whoAmIClueInformationKeys(left));
    result = whoAmIClueInformationKeys(right).some((key) => leftKeys.has(key));
  }

  const leftCache = SHARE_INFORMATION_CACHE.get(left) ?? new WeakMap<WhoAmIClue, boolean>();
  leftCache.set(right, result);
  SHARE_INFORMATION_CACHE.set(left, leftCache);

  const rightCache = SHARE_INFORMATION_CACHE.get(right) ?? new WeakMap<WhoAmIClue, boolean>();
  rightCache.set(left, result);
  SHARE_INFORMATION_CACHE.set(right, rightCache);

  return result;
}

export function whoAmISemanticIndependentCapacity(
  clues: readonly WhoAmIClue[],
  target = 12,
) {
  const normalizedTarget = Math.max(0, target);
  const cachedByTarget = SEMANTIC_CAPACITY_CACHE.get(clues);
  const cached = cachedByTarget?.get(normalizedTarget);
  if (cached != null) return cached;

  const playable = clues.filter((clue) => !whoAmIClueHasHardEditorialFailure(clue));
  const desired = Math.max(0, Math.min(normalizedTarget, playable.length));
  if (desired === 0) {
    const next = cachedByTarget ?? new Map<number, number>();
    next.set(normalizedTarget, 0);
    SEMANTIC_CAPACITY_CACHE.set(clues, next);
    return 0;
  }

  const conflicts = Array.from({ length: playable.length }, () => new Set<number>());
  for (let left = 0; left < playable.length; left += 1) {
    for (let right = left + 1; right < playable.length; right += 1) {
      const leftClue = playable[left]!;
      const rightClue = playable[right]!;
      const sameConcept = Boolean(
        leftClue.conceptId?.trim()
        && rightClue.conceptId?.trim()
        && leftClue.conceptId === rightClue.conceptId,
      );
      if (!sameConcept && !whoAmICluesShareInformation(leftClue, rightClue)) continue;
      conflicts[left]!.add(right);
      conflicts[right]!.add(left);
    }
  }

  // Callers only need capacity up to a small threshold (13 in the fast
  // full-population audit). Prove that threshold cheaply before exact search.
  const greedyOrder = Array.from({ length: playable.length }, (_value, index) => index)
    .sort((left, right) => conflicts[left]!.size - conflicts[right]!.size || left - right);
  const greedyChosen: number[] = [];
  for (const index of greedyOrder) {
    if (greedyChosen.some((selected) => conflicts[index]!.has(selected))) continue;
    greedyChosen.push(index);
    if (greedyChosen.length >= desired) {
      const next = cachedByTarget ?? new Map<number, number>();
      next.set(normalizedTarget, desired);
      SEMANTIC_CAPACITY_CACHE.set(clues, next);
      return desired;
    }
  }

  const bitCount = (value: bigint) => {
    let bits = value;
    let count = 0;
    while (bits !== 0n) {
      bits &= bits - 1n;
      count += 1;
    }
    return count;
  };

  const components: number[][] = [];
  const visited = new Set<number>();
  for (let startIndex = 0; startIndex < playable.length; startIndex += 1) {
    if (visited.has(startIndex)) continue;
    const component: number[] = [];
    const stack = [startIndex];
    visited.add(startIndex);
    while (stack.length) {
      const current = stack.pop()!;
      component.push(current);
      for (const neighbor of conflicts[current]!) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
    components.push(component);
  }

  // Harvest cheap components first so dense legacy components are searched only
  // when smaller components cannot already prove the requested threshold.
  components.sort((left, right) => left.length - right.length || left[0]! - right[0]!);

  const componentCapacity = (component: readonly number[], cap: number) => {
    if (cap <= 0) return 0;
    if (component.length <= 1) return component.length;

    const localIndex = new Map<number, number>(
      component.map((globalIndex, index) => [globalIndex, index]),
    );
    const conflictMasks = component.map((globalIndex) => {
      let mask = 0n;
      for (const neighbor of conflicts[globalIndex]!) {
        const localNeighbor = localIndex.get(neighbor);
        if (localNeighbor == null) continue;
        mask |= 1n << BigInt(localNeighbor);
      }
      return mask;
    });
    const capped = Math.min(cap, component.length);
    const memo = new Map<bigint, number>();

    const solve = (mask: bigint): number => {
      if (mask === 0n) return 0;
      const cachedResult = memo.get(mask);
      if (cachedResult != null) return cachedResult;

      const remainingCount = bitCount(mask);
      if (remainingCount <= 1) {
        memo.set(mask, remainingCount);
        return remainingCount;
      }

      let pivot = -1;
      let pivotDegree = -1;
      for (let index = 0; index < component.length; index += 1) {
        const bit = 1n << BigInt(index);
        if ((mask & bit) === 0n) continue;
        const degree = bitCount(mask & conflictMasks[index]!);
        if (degree > pivotDegree) {
          pivot = index;
          pivotDegree = degree;
        }
      }

      if (pivotDegree <= 0) {
        const result = Math.min(capped, remainingCount);
        memo.set(mask, result);
        return result;
      }

      const pivotBit = 1n << BigInt(pivot);
      const withPivot = Math.min(
        capped,
        1 + solve(mask & ~pivotBit & ~conflictMasks[pivot]!),
      );
      if (withPivot >= capped) {
        memo.set(mask, capped);
        return capped;
      }

      const withoutPivot = solve(mask & ~pivotBit);
      const result = Math.min(capped, Math.max(withPivot, withoutPivot));
      memo.set(mask, result);
      return result;
    };

    return solve((1n << BigInt(component.length)) - 1n);
  };

  let capacity = 0;
  for (const component of components) {
    const remainingNeeded = desired - capacity;
    capacity += componentCapacity(component, remainingNeeded);
    if (capacity >= desired) break;
  }

  const result = Math.min(capacity, desired);
  const next = cachedByTarget ?? new Map<number, number>();
  next.set(normalizedTarget, result);
  SEMANTIC_CAPACITY_CACHE.set(clues, next);
  return result;
}

const MALFORMED_FIRST_PERSON_PATTERNS = [
  /\bme\s+(?:says?|said|handled|chose|continued|became|played|worked|trained|recorded|returned|won|started|thought|threw|transferred|joined|made|moved|spent|credited|developed)\b/i,
  /\bI\s+(?:remains|continues|approaches|uses|trains|plays|works|says|credits|calls)\b/,
  /\bI\s+(?:is|has)\b/,
  /\bI\b[^.!?;]{0,160}\band has\b/i,
  /\bthey later married\b/i,
] as const;

export function whoAmIClueEditorialIssues(clue: WhoAmIClue, league?: WhoAmILeague): WhoAmIEditorialIssue[] {
  const issues: WhoAmIEditorialIssue[] = [];

  if (MALFORMED_FIRST_PERSON_PATTERNS.some((pattern) => pattern.test(clue.text))) {
    issues.push({
      code: "malformed-first-person",
      message: "First-person clue copy contains a malformed subject/pronoun transform.",
    });
  }

  if (
    /\b0\s+(?:ufc\s+)?(?:title fights?|title wins?|wins?|losses?|submissions?|knockouts?|games?|starts?|touchdowns?|sacks?|interceptions?|tackles?)\b/i.test(clue.text)
    || /\bwith\s+0\s+(?:career\s+)?(?:wins?|submissions?|knockouts?|touchdowns?|sacks?|interceptions?)\b/i.test(clue.text)
  ) {
    issues.push({
      code: "zero-value-production",
      message: "Zero-value production is not a useful identity clue.",
    });
  }

  if (
    league === "CFB"
    && /\bNFL career\b|\bNFL regular-season\b|\bcareer NFL (?:games|starts|touchdowns|yards|sacks|interceptions)\b/i.test(clue.text)
  ) {
    issues.push({
      code: "stage-leakage",
      message: "CFB clue contains NFL career production rather than a college identity fact.",
    });
  }
  if (
    league === "NFL"
    && /\bcollege career\b.*\b(?:games|starts|touchdowns|yards|sacks|interceptions|tackles)\b/i.test(clue.text)
  ) {
    issues.push({
      code: "stage-leakage",
      message: "NFL clue contains college production rather than an NFL identity fact.",
    });
  }

  return issues;
}

export function whoAmIClueHasHardEditorialFailure(clue: WhoAmIClue, league?: WhoAmILeague) {
  return whoAmIClueEditorialIssues(clue, league).length > 0;
}

export function whoAmISemanticClueKey(clue: WhoAmIClue) {
  const keys = whoAmIClueInformationKeys(clue);
  return keys.length ? [...keys].sort().join("&") : `copy:${normalizeWhoAmICopy(clue.text)}`;
}

export function whoAmISemanticSequenceKey(clues: readonly WhoAmIClue[]) {
  return clues.map(whoAmISemanticClueKey).join("|");
}

export function whoAmISemanticSetKey(clues: readonly WhoAmIClue[]) {
  return clues.map(whoAmISemanticClueKey).sort().join("|");
}
