import { useSearchParams } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/ufc-wheel.css";
import { WheelUfcMatch } from "./WheelUfcMatch";
import { normalizeWheelUfcCode } from "./wheelUfcModel";
import { WheelUfcSetup } from "./WheelUfcSetup";

export default function WheelUfcPage() {
  const [searchParams] = useSearchParams();
  const code = normalizeWheelUfcCode(searchParams.get("match"));
  return code ? <WheelUfcMatch code={code} /> : <WheelUfcSetup />;
}
