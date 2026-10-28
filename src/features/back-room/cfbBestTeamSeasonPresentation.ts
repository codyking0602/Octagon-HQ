import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";
import type { BuildQbVisualIdentity } from "./buildQbVisualIdentity";

export type CfbBestTeamConference = "SEC" | "Big Ten" | "Big 12" | "ACC" | "Notre Dame";

export interface CfbBestTeamSeasonPresentation {
  seasonReference: string;
  school: string;
  year: number;
  conference: CfbBestTeamConference;
  summary: string;
  primary: string;
  secondary: string;
  schoolCode: string;
}

const PRESENTATION_BY_SEASON_REFERENCE: Readonly<Record<string, CfbBestTeamSeasonPresentation>> = Object.freeze({
  "cfb-best-oklahoma-2000": { seasonReference: "cfb-best-oklahoma-2000", school: "Oklahoma", year: 2000, conference: "SEC", summary: "13-0 · National Champion", primary: "#841617", secondary: "#FDF9D8", schoolCode: "O" },
  "cfb-best-lsu-2003": { seasonReference: "cfb-best-lsu-2003", school: "LSU", year: 2003, conference: "SEC", summary: "13-1 · National Champion", primary: "#461D7C", secondary: "#FDD023", schoolCode: "L" },
  "cfb-best-auburn-2004": { seasonReference: "cfb-best-auburn-2004", school: "Auburn", year: 2004, conference: "SEC", summary: "13-0 · SEC Champion", primary: "#0C2340", secondary: "#F26522", schoolCode: "A" },
  "cfb-best-texas-2005": { seasonReference: "cfb-best-texas-2005", school: "Texas", year: 2005, conference: "SEC", summary: "13-0 · National Champion", primary: "#BF5700", secondary: "#FFFFFF", schoolCode: "T" },
  "cfb-best-florida-2006": { seasonReference: "cfb-best-florida-2006", school: "Florida", year: 2006, conference: "SEC", summary: "13-1 · National Champion", primary: "#0021A5", secondary: "#FA4616", schoolCode: "F" },
  "cfb-best-lsu-2007": { seasonReference: "cfb-best-lsu-2007", school: "LSU", year: 2007, conference: "SEC", summary: "12-2 · National Champion", primary: "#461D7C", secondary: "#FDD023", schoolCode: "L" },
  "cfb-best-florida-2008": { seasonReference: "cfb-best-florida-2008", school: "Florida", year: 2008, conference: "SEC", summary: "13-1 · National Champion", primary: "#0021A5", secondary: "#FA4616", schoolCode: "F" },
  "cfb-best-oklahoma-2008": { seasonReference: "cfb-best-oklahoma-2008", school: "Oklahoma", year: 2008, conference: "SEC", summary: "12-2 · National Runner-Up", primary: "#841617", secondary: "#FDF9D8", schoolCode: "O" },
  "cfb-best-alabama-2009": { seasonReference: "cfb-best-alabama-2009", school: "Alabama", year: 2009, conference: "SEC", summary: "14-0 · National Champion", primary: "#9E1B32", secondary: "#FFFFFF", schoolCode: "A" },
  "cfb-best-auburn-2010": { seasonReference: "cfb-best-auburn-2010", school: "Auburn", year: 2010, conference: "SEC", summary: "14-0 · National Champion", primary: "#0C2340", secondary: "#F26522", schoolCode: "A" },
  "cfb-best-alabama-2011": { seasonReference: "cfb-best-alabama-2011", school: "Alabama", year: 2011, conference: "SEC", summary: "12-1 · National Champion", primary: "#9E1B32", secondary: "#FFFFFF", schoolCode: "A" },
  "cfb-best-lsu-2011": { seasonReference: "cfb-best-lsu-2011", school: "LSU", year: 2011, conference: "SEC", summary: "13-1 · SEC Champion · National Runner-Up", primary: "#461D7C", secondary: "#FDD023", schoolCode: "L" },
  "cfb-best-alabama-2012": { seasonReference: "cfb-best-alabama-2012", school: "Alabama", year: 2012, conference: "SEC", summary: "13-1 · National Champion", primary: "#9E1B32", secondary: "#FFFFFF", schoolCode: "A" },
  "cfb-best-texas-aandm-2012": { seasonReference: "cfb-best-texas-aandm-2012", school: "Texas A&M", year: 2012, conference: "SEC", summary: "11-2 · Cotton Bowl Champion", primary: "#500000", secondary: "#FFFFFF", schoolCode: "TA" },
  "cfb-best-auburn-2013": { seasonReference: "cfb-best-auburn-2013", school: "Auburn", year: 2013, conference: "SEC", summary: "12-2 · SEC Champion · National Runner-Up", primary: "#0C2340", secondary: "#F26522", schoolCode: "A" },
  "cfb-best-missouri-2013": { seasonReference: "cfb-best-missouri-2013", school: "Missouri", year: 2013, conference: "SEC", summary: "12-2 · SEC East Champion", primary: "#000000", secondary: "#F1B82D", schoolCode: "M" },
  "cfb-best-south-carolina-2013": { seasonReference: "cfb-best-south-carolina-2013", school: "South Carolina", year: 2013, conference: "SEC", summary: "11-2 · Capital One Bowl Champion", primary: "#73000A", secondary: "#000000", schoolCode: "SC" },
  "cfb-best-mississippi-state-2014": { seasonReference: "cfb-best-mississippi-state-2014", school: "Mississippi State", year: 2014, conference: "SEC", summary: "10-3 · Orange Bowl Appearance", primary: "#5D1725", secondary: "#FFFFFF", schoolCode: "MS" },
  "cfb-best-alabama-2015": { seasonReference: "cfb-best-alabama-2015", school: "Alabama", year: 2015, conference: "SEC", summary: "14-1 · National Champion", primary: "#9E1B32", secondary: "#FFFFFF", schoolCode: "A" },
  "cfb-best-alabama-2016": { seasonReference: "cfb-best-alabama-2016", school: "Alabama", year: 2016, conference: "SEC", summary: "14-1 · SEC Champion · National Runner-Up", primary: "#9E1B32", secondary: "#FFFFFF", schoolCode: "A" },
  "cfb-best-georgia-2017": { seasonReference: "cfb-best-georgia-2017", school: "Georgia", year: 2017, conference: "SEC", summary: "13-2 · SEC Champion · National Runner-Up", primary: "#BA0C2F", secondary: "#000000", schoolCode: "G" },
  "cfb-best-arkansas-2011": { seasonReference: "cfb-best-arkansas-2011", school: "Arkansas", year: 2011, conference: "SEC", summary: "11-2 · Cotton Bowl Champion", primary: "#9D2235", secondary: "#FFFFFF", schoolCode: "A" },
  "cfb-best-lsu-2019": { seasonReference: "cfb-best-lsu-2019", school: "LSU", year: 2019, conference: "SEC", summary: "15-0 · National Champion", primary: "#461D7C", secondary: "#FDD023", schoolCode: "L" },
  "cfb-best-alabama-2020": { seasonReference: "cfb-best-alabama-2020", school: "Alabama", year: 2020, conference: "SEC", summary: "13-0 · National Champion", primary: "#9E1B32", secondary: "#FFFFFF", schoolCode: "A" },
  "cfb-best-georgia-2021": { seasonReference: "cfb-best-georgia-2021", school: "Georgia", year: 2021, conference: "SEC", summary: "14-1 · National Champion", primary: "#BA0C2F", secondary: "#000000", schoolCode: "G" },
  "cfb-best-ole-miss-2023": { seasonReference: "cfb-best-ole-miss-2023", school: "Ole Miss", year: 2023, conference: "SEC", summary: "11-2 · Peach Bowl Champion", primary: "#CE1126", secondary: "#14213D", schoolCode: "OM" },
  "cfb-best-tennessee-2022": { seasonReference: "cfb-best-tennessee-2022", school: "Tennessee", year: 2022, conference: "SEC", summary: "11-2 · Orange Bowl Champion", primary: "#FF8200", secondary: "#FFFFFF", schoolCode: "T" },
  "cfb-best-georgia-2022": { seasonReference: "cfb-best-georgia-2022", school: "Georgia", year: 2022, conference: "SEC", summary: "15-0 · National Champion", primary: "#BA0C2F", secondary: "#000000", schoolCode: "G" },
  "cfb-best-georgia-2023": { seasonReference: "cfb-best-georgia-2023", school: "Georgia", year: 2023, conference: "SEC", summary: "13-1 · Orange Bowl Champion", primary: "#BA0C2F", secondary: "#000000", schoolCode: "G" },
  "cfb-best-texas-2023": { seasonReference: "cfb-best-texas-2023", school: "Texas", year: 2023, conference: "SEC", summary: "12-2 · Big 12 Champion · CFP Semifinalist", primary: "#BF5700", secondary: "#FFFFFF", schoolCode: "T" },
  "cfb-best-kentucky-2018": { seasonReference: "cfb-best-kentucky-2018", school: "Kentucky", year: 2018, conference: "SEC", summary: "10-3 · Citrus Bowl Champion", primary: "#0033A0", secondary: "#FFFFFF", schoolCode: "K" },
  "cfb-best-vanderbilt-2025": { seasonReference: "cfb-best-vanderbilt-2025", school: "Vanderbilt", year: 2025, conference: "SEC", summary: "10-3 · ReliaQuest Bowl Appearance", primary: "#866D4B", secondary: "#000000", schoolCode: "V" },
  "cfb-best-nebraska-2001": { seasonReference: "cfb-best-nebraska-2001", school: "Nebraska", year: 2001, conference: "Big Ten", summary: "11-2 · National Runner-Up", primary: "#E41C38", secondary: "#FFFFFF", schoolCode: "N" },
  "cfb-best-ohio-state-2002": { seasonReference: "cfb-best-ohio-state-2002", school: "Ohio State", year: 2002, conference: "Big Ten", summary: "14-0 · National Champion", primary: "#BB0000", secondary: "#666666", schoolCode: "OS" },
  "cfb-best-usc-2003": { seasonReference: "cfb-best-usc-2003", school: "USC", year: 2003, conference: "Big Ten", summary: "12-1 · AP National Champion", primary: "#990000", secondary: "#FFC72C", schoolCode: "U" },
  "cfb-best-usc-2004": { seasonReference: "cfb-best-usc-2004", school: "USC", year: 2004, conference: "Big Ten", summary: "13-0 · National Champion", primary: "#990000", secondary: "#FFC72C", schoolCode: "U" },
  "cfb-best-usc-2005": { seasonReference: "cfb-best-usc-2005", school: "USC", year: 2005, conference: "Big Ten", summary: "12-1 · National Runner-Up", primary: "#990000", secondary: "#FFC72C", schoolCode: "U" },
  "cfb-best-penn-state-2005": { seasonReference: "cfb-best-penn-state-2005", school: "Penn State", year: 2005, conference: "Big Ten", summary: "11-1 · Big Ten Co-Champion · Orange Bowl Champion", primary: "#041E42", secondary: "#FFFFFF", schoolCode: "PS" },
  "cfb-best-ohio-state-2006": { seasonReference: "cfb-best-ohio-state-2006", school: "Ohio State", year: 2006, conference: "Big Ten", summary: "12-1 · Big Ten Champion · National Runner-Up", primary: "#BB0000", secondary: "#666666", schoolCode: "OS" },
  "cfb-best-usc-2008": { seasonReference: "cfb-best-usc-2008", school: "USC", year: 2008, conference: "Big Ten", summary: "12-1 · Rose Bowl Champion", primary: "#990000", secondary: "#FFC72C", schoolCode: "U" },
  "cfb-best-iowa-2009": { seasonReference: "cfb-best-iowa-2009", school: "Iowa", year: 2009, conference: "Big Ten", summary: "11-2 · Orange Bowl Champion", primary: "#FFCD00", secondary: "#000000", schoolCode: "I" },
  "cfb-best-oregon-2010": { seasonReference: "cfb-best-oregon-2010", school: "Oregon", year: 2010, conference: "Big Ten", summary: "12-1 · Pac-10 Champion · National Runner-Up", primary: "#154733", secondary: "#FEE123", schoolCode: "O" },
  "cfb-best-wisconsin-2010": { seasonReference: "cfb-best-wisconsin-2010", school: "Wisconsin", year: 2010, conference: "Big Ten", summary: "11-2 · Big Ten Co-Champion", primary: "#C5050C", secondary: "#FFFFFF", schoolCode: "W" },
  "cfb-best-wisconsin-2011": { seasonReference: "cfb-best-wisconsin-2011", school: "Wisconsin", year: 2011, conference: "Big Ten", summary: "11-3 · Big Ten Champion", primary: "#C5050C", secondary: "#FFFFFF", schoolCode: "W" },
  "cfb-best-oregon-2012": { seasonReference: "cfb-best-oregon-2012", school: "Oregon", year: 2012, conference: "Big Ten", summary: "12-1 · Fiesta Bowl Champion", primary: "#154733", secondary: "#FEE123", schoolCode: "O" },
  "cfb-best-michigan-state-2013": { seasonReference: "cfb-best-michigan-state-2013", school: "Michigan State", year: 2013, conference: "Big Ten", summary: "13-1 · Big Ten Champion · Rose Bowl Champion", primary: "#18453B", secondary: "#FFFFFF", schoolCode: "MS" },
  "cfb-best-ohio-state-2014": { seasonReference: "cfb-best-ohio-state-2014", school: "Ohio State", year: 2014, conference: "Big Ten", summary: "14-1 · National Champion", primary: "#BB0000", secondary: "#666666", schoolCode: "OS" },
  "cfb-best-oregon-2014": { seasonReference: "cfb-best-oregon-2014", school: "Oregon", year: 2014, conference: "Big Ten", summary: "13-2 · Pac-12 Champion · National Runner-Up", primary: "#154733", secondary: "#FEE123", schoolCode: "O" },
  "cfb-best-iowa-2015": { seasonReference: "cfb-best-iowa-2015", school: "Iowa", year: 2015, conference: "Big Ten", summary: "12-2 · Big Ten West Champion", primary: "#FFCD00", secondary: "#000000", schoolCode: "I" },
  "cfb-best-michigan-state-2015": { seasonReference: "cfb-best-michigan-state-2015", school: "Michigan State", year: 2015, conference: "Big Ten", summary: "12-2 · Big Ten Champion · CFP Semifinalist", primary: "#18453B", secondary: "#FFFFFF", schoolCode: "MS" },
  "cfb-best-penn-state-2016": { seasonReference: "cfb-best-penn-state-2016", school: "Penn State", year: 2016, conference: "Big Ten", summary: "11-3 · Big Ten Champion", primary: "#041E42", secondary: "#FFFFFF", schoolCode: "PS" },
  "cfb-best-washington-2016": { seasonReference: "cfb-best-washington-2016", school: "Washington", year: 2016, conference: "Big Ten", summary: "12-2 · Pac-12 Champion · CFP Semifinalist", primary: "#4B2E83", secondary: "#B7A57A", schoolCode: "W" },
  "cfb-best-wisconsin-2017": { seasonReference: "cfb-best-wisconsin-2017", school: "Wisconsin", year: 2017, conference: "Big Ten", summary: "13-1 · Orange Bowl Champion", primary: "#C5050C", secondary: "#FFFFFF", schoolCode: "W" },
  "cfb-best-ohio-state-2019": { seasonReference: "cfb-best-ohio-state-2019", school: "Ohio State", year: 2019, conference: "Big Ten", summary: "13-1 · Big Ten Champion · CFP Semifinalist", primary: "#BB0000", secondary: "#666666", schoolCode: "OS" },
  "cfb-best-minnesota-2019": { seasonReference: "cfb-best-minnesota-2019", school: "Minnesota", year: 2019, conference: "Big Ten", summary: "11-2 · Outback Bowl Champion", primary: "#7A0019", secondary: "#FFCC33", schoolCode: "M" },
  "cfb-best-ohio-state-2020": { seasonReference: "cfb-best-ohio-state-2020", school: "Ohio State", year: 2020, conference: "Big Ten", summary: "7-1 · Big Ten Champion · National Runner-Up", primary: "#BB0000", secondary: "#666666", schoolCode: "OS" },
  "cfb-best-michigan-2021": { seasonReference: "cfb-best-michigan-2021", school: "Michigan", year: 2021, conference: "Big Ten", summary: "12-2 · Big Ten Champion · CFP Semifinalist", primary: "#00274C", secondary: "#FFCB05", schoolCode: "M" },
  "cfb-best-michigan-2022": { seasonReference: "cfb-best-michigan-2022", school: "Michigan", year: 2022, conference: "Big Ten", summary: "13-1 · Big Ten Champion · CFP Semifinalist", primary: "#00274C", secondary: "#FFCB05", schoolCode: "M" },
  "cfb-best-michigan-2023": { seasonReference: "cfb-best-michigan-2023", school: "Michigan", year: 2023, conference: "Big Ten", summary: "15-0 · National Champion", primary: "#00274C", secondary: "#FFCB05", schoolCode: "M" },
  "cfb-best-washington-2023": { seasonReference: "cfb-best-washington-2023", school: "Washington", year: 2023, conference: "Big Ten", summary: "14-1 · Pac-12 Champion · National Runner-Up", primary: "#4B2E83", secondary: "#B7A57A", schoolCode: "W" },
  "cfb-best-oregon-2024": { seasonReference: "cfb-best-oregon-2024", school: "Oregon", year: 2024, conference: "Big Ten", summary: "13-1 · Big Ten Champion", primary: "#154733", secondary: "#FEE123", schoolCode: "O" },
  "cfb-best-ohio-state-2024": { seasonReference: "cfb-best-ohio-state-2024", school: "Ohio State", year: 2024, conference: "Big Ten", summary: "14-2 · National Champion", primary: "#BB0000", secondary: "#666666", schoolCode: "OS" },
  "cfb-best-penn-state-2024": { seasonReference: "cfb-best-penn-state-2024", school: "Penn State", year: 2024, conference: "Big Ten", summary: "13-3 · CFP Semifinalist", primary: "#041E42", secondary: "#FFFFFF", schoolCode: "PS" },
  "cfb-best-indiana-2025": { seasonReference: "cfb-best-indiana-2025", school: "Indiana", year: 2025, conference: "Big Ten", summary: "16-0 · National Champion", primary: "#990000", secondary: "#EEEDEB", schoolCode: "I" },
  "cfb-best-colorado-2001": { seasonReference: "cfb-best-colorado-2001", school: "Colorado", year: 2001, conference: "Big 12", summary: "10-3 · Big 12 Champion", primary: "#CFB87C", secondary: "#000000", schoolCode: "C" },
  "cfb-best-utah-2004": { seasonReference: "cfb-best-utah-2004", school: "Utah", year: 2004, conference: "Big 12", summary: "12-0 · Fiesta Bowl Champion", primary: "#CC0000", secondary: "#FFFFFF", schoolCode: "U" },
  "cfb-best-west-virginia-2005": { seasonReference: "cfb-best-west-virginia-2005", school: "West Virginia", year: 2005, conference: "Big 12", summary: "11-1 · Sugar Bowl Champion", primary: "#002855", secondary: "#EAAA00", schoolCode: "WV" },
  "cfb-best-kansas-2007": { seasonReference: "cfb-best-kansas-2007", school: "Kansas", year: 2007, conference: "Big 12", summary: "12-1 · Orange Bowl Champion", primary: "#0051BA", secondary: "#E8000D", schoolCode: "K" },
  "cfb-best-west-virginia-2007": { seasonReference: "cfb-best-west-virginia-2007", school: "West Virginia", year: 2007, conference: "Big 12", summary: "11-2 · Fiesta Bowl Champion", primary: "#002855", secondary: "#EAAA00", schoolCode: "WV" },
  "cfb-best-utah-2008": { seasonReference: "cfb-best-utah-2008", school: "Utah", year: 2008, conference: "Big 12", summary: "13-0 · Sugar Bowl Champion", primary: "#CC0000", secondary: "#FFFFFF", schoolCode: "U" },
  "cfb-best-texas-tech-2008": { seasonReference: "cfb-best-texas-tech-2008", school: "Texas Tech", year: 2008, conference: "Big 12", summary: "11-2 · Big 12 South Co-Champion", primary: "#CC0000", secondary: "#000000", schoolCode: "TT" },
  "cfb-best-cincinnati-2009": { seasonReference: "cfb-best-cincinnati-2009", school: "Cincinnati", year: 2009, conference: "Big 12", summary: "12-1 · Big East Champion", primary: "#E00122", secondary: "#000000", schoolCode: "C" },
  "cfb-best-tcu-2010": { seasonReference: "cfb-best-tcu-2010", school: "TCU", year: 2010, conference: "Big 12", summary: "13-0 · Rose Bowl Champion", primary: "#4D1979", secondary: "#FFFFFF", schoolCode: "T" },
  "cfb-best-houston-2011": { seasonReference: "cfb-best-houston-2011", school: "Houston", year: 2011, conference: "Big 12", summary: "13-1 · Bowl Champion", primary: "#C8102E", secondary: "#FFFFFF", schoolCode: "H" },
  "cfb-best-oklahoma-state-2011": { seasonReference: "cfb-best-oklahoma-state-2011", school: "Oklahoma State", year: 2011, conference: "Big 12", summary: "12-1 · Big 12 Champion · Fiesta Bowl Champion", primary: "#FF7300", secondary: "#000000", schoolCode: "OS" },
  "cfb-best-kansas-state-2012": { seasonReference: "cfb-best-kansas-state-2012", school: "Kansas State", year: 2012, conference: "Big 12", summary: "11-2 · Big 12 Champion", primary: "#512888", secondary: "#FFFFFF", schoolCode: "KS" },
  "cfb-best-baylor-2013": { seasonReference: "cfb-best-baylor-2013", school: "Baylor", year: 2013, conference: "Big 12", summary: "11-2 · Big 12 Champion", primary: "#154734", secondary: "#FFB81C", schoolCode: "B" },
  "cfb-best-ucf-2013": { seasonReference: "cfb-best-ucf-2013", school: "UCF", year: 2013, conference: "Big 12", summary: "12-1 · Fiesta Bowl Champion", primary: "#000000", secondary: "#FFC904", schoolCode: "U" },
  "cfb-best-arizona-2014": { seasonReference: "cfb-best-arizona-2014", school: "Arizona", year: 2014, conference: "Big 12", summary: "10-4 · Pac-12 South Champion", primary: "#CC0033", secondary: "#003366", schoolCode: "A" },
  "cfb-best-baylor-2014": { seasonReference: "cfb-best-baylor-2014", school: "Baylor", year: 2014, conference: "Big 12", summary: "11-2 · Big 12 Co-Champion", primary: "#154734", secondary: "#FFB81C", schoolCode: "B" },
  "cfb-best-tcu-2014": { seasonReference: "cfb-best-tcu-2014", school: "TCU", year: 2014, conference: "Big 12", summary: "12-1 · Big 12 Co-Champion · Peach Bowl Champion", primary: "#4D1979", secondary: "#FFFFFF", schoolCode: "T" },
  "cfb-best-houston-2015": { seasonReference: "cfb-best-houston-2015", school: "Houston", year: 2015, conference: "Big 12", summary: "13-1 · AAC Champion · Peach Bowl Champion", primary: "#C8102E", secondary: "#FFFFFF", schoolCode: "H" },
  "cfb-best-ucf-2017": { seasonReference: "cfb-best-ucf-2017", school: "UCF", year: 2017, conference: "Big 12", summary: "13-0 · AAC Champion · Peach Bowl Champion", primary: "#000000", secondary: "#FFC904", schoolCode: "U" },
  "cfb-best-byu-2020": { seasonReference: "cfb-best-byu-2020", school: "BYU", year: 2020, conference: "Big 12", summary: "11-1 · Boca Raton Bowl Champion", primary: "#002E5D", secondary: "#FFFFFF", schoolCode: "B" },
  "cfb-best-iowa-state-2020": { seasonReference: "cfb-best-iowa-state-2020", school: "Iowa State", year: 2020, conference: "Big 12", summary: "9-3 · Fiesta Bowl Champion", primary: "#C8102E", secondary: "#F1BE48", schoolCode: "IS" },
  "cfb-best-baylor-2021": { seasonReference: "cfb-best-baylor-2021", school: "Baylor", year: 2021, conference: "Big 12", summary: "12-2 · Big 12 Champion · Sugar Bowl Champion", primary: "#154734", secondary: "#FFB81C", schoolCode: "B" },
  "cfb-best-cincinnati-2021": { seasonReference: "cfb-best-cincinnati-2021", school: "Cincinnati", year: 2021, conference: "Big 12", summary: "13-1 · AAC Champion · CFP Semifinalist", primary: "#E00122", secondary: "#000000", schoolCode: "C" },
  "cfb-best-oklahoma-state-2021": { seasonReference: "cfb-best-oklahoma-state-2021", school: "Oklahoma State", year: 2021, conference: "Big 12", summary: "12-2 · Fiesta Bowl Champion", primary: "#FF7300", secondary: "#000000", schoolCode: "OS" },
  "cfb-best-kansas-state-2022": { seasonReference: "cfb-best-kansas-state-2022", school: "Kansas State", year: 2022, conference: "Big 12", summary: "10-4 · Big 12 Champion", primary: "#512888", secondary: "#FFFFFF", schoolCode: "KS" },
  "cfb-best-tcu-2022": { seasonReference: "cfb-best-tcu-2022", school: "TCU", year: 2022, conference: "Big 12", summary: "13-2 · National Runner-Up", primary: "#4D1979", secondary: "#FFFFFF", schoolCode: "T" },
  "cfb-best-arizona-2023": { seasonReference: "cfb-best-arizona-2023", school: "Arizona", year: 2023, conference: "Big 12", summary: "10-3 · Alamo Bowl Champion", primary: "#CC0033", secondary: "#003366", schoolCode: "A" },
  "cfb-best-arizona-state-2024": { seasonReference: "cfb-best-arizona-state-2024", school: "Arizona State", year: 2024, conference: "Big 12", summary: "11-3 · Big 12 Champion · CFP Quarterfinalist", primary: "#8C1D40", secondary: "#FFC627", schoolCode: "AS" },
  "cfb-best-byu-2024": { seasonReference: "cfb-best-byu-2024", school: "BYU", year: 2024, conference: "Big 12", summary: "11-2 · Alamo Bowl Champion", primary: "#002E5D", secondary: "#FFFFFF", schoolCode: "B" },
  "cfb-best-iowa-state-2024": { seasonReference: "cfb-best-iowa-state-2024", school: "Iowa State", year: 2024, conference: "Big 12", summary: "11-3 · Pop-Tarts Bowl Champion", primary: "#C8102E", secondary: "#F1BE48", schoolCode: "IS" },
  "cfb-best-texas-tech-2025": { seasonReference: "cfb-best-texas-tech-2025", school: "Texas Tech", year: 2025, conference: "Big 12", summary: "12-2 · Big 12 Champion · CFP Quarterfinalist", primary: "#CC0000", secondary: "#000000", schoolCode: "TT" },
  "cfb-best-byu-2025": { seasonReference: "cfb-best-byu-2025", school: "BYU", year: 2025, conference: "Big 12", summary: "12-2 · Pop-Tarts Bowl Champion", primary: "#002E5D", secondary: "#FFFFFF", schoolCode: "B" },
  "cfb-best-miami-2000": { seasonReference: "cfb-best-miami-2000", school: "Miami", year: 2000, conference: "ACC", summary: "11-1 · Sugar Bowl Champion", primary: "#F47321", secondary: "#005030", schoolCode: "M" },
  "cfb-best-miami-2001": { seasonReference: "cfb-best-miami-2001", school: "Miami", year: 2001, conference: "ACC", summary: "12-0 · National Champion", primary: "#F47321", secondary: "#005030", schoolCode: "M" },
  "cfb-best-miami-2002": { seasonReference: "cfb-best-miami-2002", school: "Miami", year: 2002, conference: "ACC", summary: "12-1 · National Runner-Up", primary: "#F47321", secondary: "#005030", schoolCode: "M" },
  "cfb-best-florida-state-2000": { seasonReference: "cfb-best-florida-state-2000", school: "Florida State", year: 2000, conference: "ACC", summary: "11-2 · National Runner-Up", primary: "#782F40", secondary: "#CEB888", schoolCode: "FS" },
  "cfb-best-nc-state-2002": { seasonReference: "cfb-best-nc-state-2002", school: "NC State", year: 2002, conference: "ACC", summary: "11-3 · Gator Bowl Champion", primary: "#CC0000", secondary: "#000000", schoolCode: "NS" },
  "cfb-best-california-2004": { seasonReference: "cfb-best-california-2004", school: "California", year: 2004, conference: "ACC", summary: "10-2 · 10-win season", primary: "#003262", secondary: "#FDB515", schoolCode: "C" },
  "cfb-best-virginia-tech-2004": { seasonReference: "cfb-best-virginia-tech-2004", school: "Virginia Tech", year: 2004, conference: "ACC", summary: "10-3 · ACC Champion", primary: "#861F41", secondary: "#E87722", schoolCode: "VT" },
  "cfb-best-virginia-tech-2005": { seasonReference: "cfb-best-virginia-tech-2005", school: "Virginia Tech", year: 2005, conference: "ACC", summary: "11-2 · Gator Bowl Champion", primary: "#861F41", secondary: "#E87722", schoolCode: "VT" },
  "cfb-best-louisville-2006": { seasonReference: "cfb-best-louisville-2006", school: "Louisville", year: 2006, conference: "ACC", summary: "12-1 · Big East Champion · Orange Bowl Champion", primary: "#AD0000", secondary: "#000000", schoolCode: "L" },
  "cfb-best-wake-forest-2006": { seasonReference: "cfb-best-wake-forest-2006", school: "Wake Forest", year: 2006, conference: "ACC", summary: "11-3 · ACC Champion", primary: "#9E7E38", secondary: "#000000", schoolCode: "WF" },
  "cfb-best-boston-college-2007": { seasonReference: "cfb-best-boston-college-2007", school: "Boston College", year: 2007, conference: "ACC", summary: "11-3 · ACC Atlantic Champion", primary: "#8A100B", secondary: "#B29D6C", schoolCode: "BC" },
  "cfb-best-virginia-tech-2007": { seasonReference: "cfb-best-virginia-tech-2007", school: "Virginia Tech", year: 2007, conference: "ACC", summary: "11-3 · ACC Champion", primary: "#861F41", secondary: "#E87722", schoolCode: "VT" },
  "cfb-best-virginia-tech-2010": { seasonReference: "cfb-best-virginia-tech-2010", school: "Virginia Tech", year: 2010, conference: "ACC", summary: "11-3 · ACC Champion", primary: "#861F41", secondary: "#E87722", schoolCode: "VT" },
  "cfb-best-stanford-2010": { seasonReference: "cfb-best-stanford-2010", school: "Stanford", year: 2010, conference: "ACC", summary: "12-1 · Orange Bowl Champion", primary: "#8C1515", secondary: "#FFFFFF", schoolCode: "S" },
  "cfb-best-stanford-2011": { seasonReference: "cfb-best-stanford-2011", school: "Stanford", year: 2011, conference: "ACC", summary: "11-2 · Fiesta Bowl Appearance", primary: "#8C1515", secondary: "#FFFFFF", schoolCode: "S" },
  "cfb-best-florida-state-2012": { seasonReference: "cfb-best-florida-state-2012", school: "Florida State", year: 2012, conference: "ACC", summary: "12-2 · ACC Champion · Orange Bowl Champion", primary: "#782F40", secondary: "#CEB888", schoolCode: "FS" },
  "cfb-best-stanford-2012": { seasonReference: "cfb-best-stanford-2012", school: "Stanford", year: 2012, conference: "ACC", summary: "12-2 · Pac-12 Champion · Rose Bowl Champion", primary: "#8C1515", secondary: "#FFFFFF", schoolCode: "S" },
  "cfb-best-duke-2013": { seasonReference: "cfb-best-duke-2013", school: "Duke", year: 2013, conference: "ACC", summary: "10-4 · ACC Coastal Champion", primary: "#003087", secondary: "#FFFFFF", schoolCode: "D" },
  "cfb-best-florida-state-2013": { seasonReference: "cfb-best-florida-state-2013", school: "Florida State", year: 2013, conference: "ACC", summary: "14-0 · National Champion", primary: "#782F40", secondary: "#CEB888", schoolCode: "FS" },
  "cfb-best-louisville-2013": { seasonReference: "cfb-best-louisville-2013", school: "Louisville", year: 2013, conference: "ACC", summary: "12-1 · Bowl Champion", primary: "#AD0000", secondary: "#000000", schoolCode: "L" },
  "cfb-best-florida-state-2014": { seasonReference: "cfb-best-florida-state-2014", school: "Florida State", year: 2014, conference: "ACC", summary: "13-1 · ACC Champion · CFP Semifinalist", primary: "#782F40", secondary: "#CEB888", schoolCode: "FS" },
  "cfb-best-georgia-tech-2014": { seasonReference: "cfb-best-georgia-tech-2014", school: "Georgia Tech", year: 2014, conference: "ACC", summary: "11-3 · Orange Bowl Champion", primary: "#B3A369", secondary: "#003057", schoolCode: "GT" },
  "cfb-best-stanford-2015": { seasonReference: "cfb-best-stanford-2015", school: "Stanford", year: 2015, conference: "ACC", summary: "12-2 · Pac-12 Champion · Rose Bowl Champion", primary: "#8C1515", secondary: "#FFFFFF", schoolCode: "S" },
  "cfb-best-clemson-2015": { seasonReference: "cfb-best-clemson-2015", school: "Clemson", year: 2015, conference: "ACC", summary: "14-1 · ACC Champion · National Runner-Up", primary: "#F56600", secondary: "#522D80", schoolCode: "C" },
  "cfb-best-north-carolina-2015": { seasonReference: "cfb-best-north-carolina-2015", school: "North Carolina", year: 2015, conference: "ACC", summary: "11-3 · ACC Coastal Champion", primary: "#7BAFD4", secondary: "#FFFFFF", schoolCode: "NC" },
  "cfb-best-clemson-2016": { seasonReference: "cfb-best-clemson-2016", school: "Clemson", year: 2016, conference: "ACC", summary: "14-1 · National Champion", primary: "#F56600", secondary: "#522D80", schoolCode: "C" },
  "cfb-best-clemson-2018": { seasonReference: "cfb-best-clemson-2018", school: "Clemson", year: 2018, conference: "ACC", summary: "15-0 · National Champion", primary: "#F56600", secondary: "#522D80", schoolCode: "C" },
  "cfb-best-clemson-2019": { seasonReference: "cfb-best-clemson-2019", school: "Clemson", year: 2019, conference: "ACC", summary: "14-1 · ACC Champion · National Runner-Up", primary: "#F56600", secondary: "#522D80", schoolCode: "C" },
  "cfb-best-pitt-2021": { seasonReference: "cfb-best-pitt-2021", school: "Pitt", year: 2021, conference: "ACC", summary: "11-3 · ACC Champion", primary: "#003594", secondary: "#FFB81C", schoolCode: "P" },
  "cfb-best-florida-state-2023": { seasonReference: "cfb-best-florida-state-2023", school: "Florida State", year: 2023, conference: "ACC", summary: "13-1 · ACC Champion", primary: "#782F40", secondary: "#CEB888", schoolCode: "FS" },
  "cfb-best-smu-2024": { seasonReference: "cfb-best-smu-2024", school: "SMU", year: 2024, conference: "ACC", summary: "11-3 · CFP Participant", primary: "#C8102E", secondary: "#0033A0", schoolCode: "S" },
  "cfb-best-miami-2025": { seasonReference: "cfb-best-miami-2025", school: "Miami", year: 2025, conference: "ACC", summary: "13-3 · National Runner-Up", primary: "#F47321", secondary: "#005030", schoolCode: "M" },
  "cfb-best-notre-dame-2012": { seasonReference: "cfb-best-notre-dame-2012", school: "Notre Dame", year: 2012, conference: "Notre Dame", summary: "12-1 · National Runner-Up", primary: "#0C2340", secondary: "#C99700", schoolCode: "ND" },
  "cfb-best-notre-dame-2018": { seasonReference: "cfb-best-notre-dame-2018", school: "Notre Dame", year: 2018, conference: "Notre Dame", summary: "12-1 · CFP Semifinalist", primary: "#0C2340", secondary: "#C99700", schoolCode: "ND" },
  "cfb-best-notre-dame-2020": { seasonReference: "cfb-best-notre-dame-2020", school: "Notre Dame", year: 2020, conference: "Notre Dame", summary: "10-2 · CFP Semifinalist", primary: "#0C2340", secondary: "#C99700", schoolCode: "ND" },
  "cfb-best-notre-dame-2024": { seasonReference: "cfb-best-notre-dame-2024", school: "Notre Dame", year: 2024, conference: "Notre Dame", summary: "14-2 · National Runner-Up", primary: "#0C2340", secondary: "#C99700", schoolCode: "ND" },
});

const ASSET_SCHOOL_ALIASES: Readonly<Record<string, string>> = Object.freeze({"Pitt":"Pittsburgh"});

function rgbChannels(hex: string) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

export function cfbBestTeamSeasonReferenceFromItemReference(itemReference: string | null | undefined) {
  if (!itemReference) return null;
  const marker = "--board--";
  const index = itemReference.indexOf(marker);
  return index === -1 ? itemReference : itemReference.slice(0, index);
}

export function cfbBestTeamBoardLabel(itemReference: string | null | undefined) {
  if (!itemReference) return null;
  const marker = "--board--";
  const index = itemReference.indexOf(marker);
  if (index === -1) return null;
  const encoded = itemReference.slice(index + marker.length);
  const [kind, one, two, nd] = encoded.split("__");
  if (kind === "single" && one) return `${decodeURIComponent(one)} Teams`;
  if (kind === "split" && one && two) {
    const suffix = nd === "nd" ? " + Notre Dame" : "";
    return `${decodeURIComponent(one)} + ${decodeURIComponent(two)}${suffix}`;
  }
  return null;
}

export function cfbBestTeamSeasonPresentation(itemReference: string | null | undefined) {
  const ref = cfbBestTeamSeasonReferenceFromItemReference(itemReference);
  return ref ? PRESENTATION_BY_SEASON_REFERENCE[ref] ?? null : null;
}

export function cfbBestTeamSchoolVisualIdentity(school: string): BuildQbVisualIdentity | null {
  const season = Object.values(PRESENTATION_BY_SEASON_REFERENCE).find((entry) => entry.school === school);
  if (!season) return null;
  const assetSchool = ASSET_SCHOOL_ALIASES[school] ?? school;
  const asset = footballTeamAssets[footballCfbTeamMediaId(assetSchool)];
  return {
    teamCode: season.schoolCode,
    teamName: school,
    primary: season.primary,
    primaryRgb: rgbChannels(season.primary),
    secondary: season.secondary,
    logoSrc: asset?.src ?? null,
  };
}

export function cfbBestTeamSeasonVisualIdentity(itemReference: string | null | undefined): BuildQbVisualIdentity | null {
  const season = cfbBestTeamSeasonPresentation(itemReference);
  if (!season) return null;
  const schoolVisual = cfbBestTeamSchoolVisualIdentity(season.school);
  if (!schoolVisual) return null;
  return {
    ...schoolVisual,
    teamName: `${season.school} · ${season.year}`,
  };
}

export const CFB_BEST_TEAM_SEASON_COUNT = Object.keys(PRESENTATION_BY_SEASON_REFERENCE).length;
