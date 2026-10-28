export interface PickSpotlightWatch {
  fighterSlug: string;
  url: string;
}

export interface PickSpotlightFighter {
  fighterSlug: string;
  record: string;
  age: string;
  height: string;
  reach: string;
  stance: string;
  edges: string[];
}

export interface PickSpotlight {
  boutId: string;
  preview: string;
  red: PickSpotlightFighter;
  blue: PickSpotlightFighter;
  watchSpotlights: PickSpotlightWatch[];
  source: "UFCStats";
  generatedAt: string;
}
