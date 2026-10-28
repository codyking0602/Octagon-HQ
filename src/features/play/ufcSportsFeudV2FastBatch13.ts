import {makeUfcFeudDraft,type UFCFeudDraftRow} from "./ufcSportsFeudV2DraftHelpers";
/** Distinct fight administration, experience and health prompts; editorial staging, not live. */
const ROWS=[
  {
    "id": "ufc-v2-fast13-contract-negotiations",
    "lane": "ufc-bout-agreement-negotiation-topics",
    "prompt": "Name a detail a UFC fighter and their manager might review before signing a bout agreement.",
    "kind": "other",
    "ranked": "Opponent|Purse|Fight date|Weight class|Number of rounds|Location|Medical requirements|Contract terms",
    "extras": "Travel arrangements|Pay schedule|Short-notice compensation|Main card placement|Bonus eligibility|Corner credentials|Broadcast commitments|Fight week schedule",
    "aliases": {
      "Purse": [
        "Fight pay"
      ],
      "Opponent": [
        "Who they fight"
      ],
      "Fight date": [
        "Date"
      ],
      "Location": [
        "Venue"
      ],
      "Number of rounds": [
        "Rounds"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-mouthguard-purpose",
    "lane": "mma-competition-mouthguard-protections",
    "prompt": "Name a reason a UFC fighter wears a mouthguard inside the Octagon.",
    "kind": "other",
    "ranked": "Protect teeth|Reduce mouth injuries|Protect lips|Protect tongue|Cushion jaw impact|Prevent bitten cheek|Meet competition rules|Protect dental work",
    "extras": "Cover braces|Avoid chipped teeth|Prevent cracked teeth|Protect gums|Improve safety|Reduce mouth bleeding|Absorb force",
    "aliases": {
      "Protect teeth": [
        "Teeth",
        "Dental protection"
      ],
      "Protect lips": [
        "Lips"
      ],
      "Protect tongue": [
        "Tongue"
      ],
      "Meet competition rules": [
        "Required gear"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-walkout-song",
    "lane": "ufc-fighter-walkout-song-selection",
    "prompt": "Name something that might influence a UFC fighter's choice of walkout music.",
    "kind": "other",
    "ranked": "Personal taste|Hometown pride|Pump-up energy|Lyrics|Culture|Family meaning|Favorite artist|Crowd reaction",
    "extras": "Tradition|Nostalgia|Gym recommendation|Fan request|Memorable beat|Motivational message|National pride|Music genre",
    "aliases": {
      "Personal taste": [
        "Favorite song"
      ],
      "Hometown pride": [
        "Represent hometown"
      ],
      "Pump-up energy": [
        "Hype"
      ],
      "Culture": [
        "Heritage"
      ],
      "Family meaning": [
        "Family"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-fighter-sleep",
    "lane": "ufc-pre-fight-sleep-disruption",
    "prompt": "Name something that might disturb a UFC fighter's sleep during fight week.",
    "kind": "other",
    "ranked": "Nerves|Jet lag|Weight cutting|Media obligations|Hotel noise|Pain|Early weigh-ins|Travel fatigue",
    "extras": "Late flight|Dehydration|Different time zone|Crowd excitement|Thinking about opponent|Late-night training",
    "aliases": {
      "Nerves": [
        "Anxiety"
      ],
      "Jet lag": [
        "Time-zone change"
      ],
      "Hotel noise": [
        "Noise"
      ],
      "Media obligations": [
        "Interviews"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-sponsor-duties",
    "lane": "ufc-athlete-partner-promotional-duties",
    "prompt": "Name something a UFC fighter might do for an equipment or commercial sponsor away from a bout.",
    "kind": "other",
    "ranked": "Post on social media|Appear in commercial|Wear sponsor gear|Attend brand event|Film promotional video|Take photos|Give interview|Sign autographs",
    "extras": "Product demonstration|Brand campaign|Meet fans|Logo photoshoot|Online endorsement|Use sponsored equipment|Training content",
    "aliases": {
      "Post on social media": [
        "Sponsored post"
      ],
      "Appear in commercial": [
        "Advertisement"
      ],
      "Wear sponsor gear": [
        "Wear logo"
      ],
      "Attend brand event": [
        "Appearance"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-suspension-recovery",
    "lane": "ufc-fighter-medical-suspension-routine",
    "prompt": "Name something a UFC fighter might do while serving a post-fight medical suspension.",
    "kind": "other",
    "ranked": "Rest|See a doctor|Rehab an injury|Avoid sparring|Get medical tests|Recover from concussion|Review fight footage|Work on nutrition",
    "extras": "Follow specialist instructions|Do light exercise if cleared|Physical therapy|Sleep|Treat cuts|Wait for clearance|Watch teammates train",
    "aliases": {
      "Rest": [
        "Recover"
      ],
      "See a doctor": [
        "Medical appointment"
      ],
      "Rehab an injury": [
        "Rehabilitation"
      ],
      "Avoid sparring": [
        "No sparring"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-close-stoppage-debate",
    "lane": "ufc-controversial-stoppage-fan-evidence",
    "prompt": "Name something fans might point to when arguing a UFC referee stopped a fight too early.",
    "kind": "other",
    "ranked": "Fighter was moving|Fighter defended punches|Fighter stood back up|Only a few strikes landed|Fighter protested|No knockout|Quick referee intervention|Fighter looked alert",
    "extras": "Fighter was conscious|Could have continued|Blocked shots|Attempted a takedown|Recovered quickly|No visible injury|Poor angle",
    "aliases": {
      "Fighter was moving": [
        "Still moving"
      ],
      "Fighter defended punches": [
        "Blocking punches"
      ],
      "Fighter protested": [
        "Protested"
      ],
      "No knockout": [
        "Not out"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-judging-paperwork",
    "lane": "ufc-official-scorecard-errors",
    "prompt": "Name a mistake that could create confusion on an official UFC judge's scorecard.",
    "kind": "other",
    "ranked": "Wrong fighter name|Wrong round|Math error|Incorrect point deduction|Unreadable writing|Transposed scores|Incomplete card|Wrong corner assignment",
    "extras": "Adding scores incorrectly|Recording a 10-8 as 10-9|Missing signature|Incorrect result total|Entering points for wrong fighter|Missing penalty|Confusing red and blue",
    "aliases": {
      "Wrong fighter name": [
        "Wrong name"
      ],
      "Wrong round": [
        "Round mixup"
      ],
      "Math error": [
        "Bad math"
      ],
      "Transposed scores": [
        "Scores reversed"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-anti-doping-visit",
    "lane": "ufc-anti-doping-collection-process",
    "prompt": "Name something that might happen when a UFC fighter undergoes a routine anti-doping sample collection.",
    "kind": "other",
    "ranked": "Identity verification|Provide urine sample|Meet collection officer|Document medication|Seal sample|Complete paperwork|Sample tracking|Check sample kit",
    "extras": "Give whereabouts|Confirm sample label|Sign forms|Chain of custody|Review testing rules|Provide blood sample|Answer medical questions|Receive collection copy",
    "aliases": {
      "Identity verification": [
        "Check ID"
      ],
      "Provide urine sample": [
        "Urine test"
      ],
      "Meet collection officer": [
        "Doping control officer"
      ],
      "Seal sample": [
        "Seal bottle"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-bout-record-checks",
    "lane": "mma-official-result-record-components",
    "prompt": "Name a detail recorded for a sanctioned UFC bout once the official result is announced.",
    "kind": "other",
    "ranked": "Winner|Loser|Result method|Round ended|Fight time|Weight division|Opponent names|Decision scores",
    "extras": "Referee|Event date|Location|Official judges|No contest ruling|Finish type|Scheduled rounds|Bout number",
    "aliases": {
      "Winner": [
        "Winning fighter"
      ],
      "Loser": [
        "Losing fighter"
      ],
      "Result method": [
        "Method of victory"
      ],
      "Round ended": [
        "Round"
      ],
      "Fight time": [
        "Time"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-fouls-penalties",
    "lane": "ufc-foul-penalty-consequences",
    "prompt": "Name a consequence a UFC fighter could face for a foul during a bout.",
    "kind": "other",
    "ranked": "Verbal warning|Point deduction|Disqualification|Time-out|Referee intervention|Doctor examination|Fight stopped|Technical decision",
    "extras": "Restart from neutral|Foul reviewed|Opponent given recovery time|Commission inquiry|No contest|Referee separates fighters|Loss by DQ",
    "aliases": {
      "Verbal warning": [
        "Warning"
      ],
      "Point deduction": [
        "Lose point"
      ],
      "Disqualification": [
        "DQ"
      ],
      "Time-out": [
        "Break"
      ],
      "Fight stopped": [
        "Stoppage"
      ]
    }
  },
  {
    "id": "ufc-v2-fast13-weighin-only-fans",
    "lane": "ufc-ceremonial-weighin-audience-appeal",
    "prompt": "Name a reason a fan might attend a UFC ceremonial weigh-in even without a fight-night ticket.",
    "kind": "other",
    "ranked": "See fighters up close|Watch faceoffs|Free or cheap entry|Take photos|Hear crowd reaction|Experience atmosphere|Support favorite fighter|Attend fan activities",
    "extras": "See championship belt|Bring children|Get event merchandise|Meet fellow fans|Take video|See famous fighters|Travel-day activity|Hear ring announcer",
    "aliases": {
      "See fighters up close": [
        "See fighters"
      ],
      "Watch faceoffs": [
        "Staredowns"
      ],
      "Take photos": [
        "Pictures"
      ],
      "Support favorite fighter": [
        "Cheer fighter"
      ]
    }
  }
] as const satisfies readonly UFCFeudDraftRow[];
export const UFC_SPORTS_FEUD_V2_FAST_BATCH13=makeUfcFeudDraft(ROWS);
