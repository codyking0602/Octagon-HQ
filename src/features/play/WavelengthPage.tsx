import { useNavigate } from "react-router-dom";
import WavelengthGame from "./WavelengthGame";

export default function WavelengthPage() {
  const navigate = useNavigate();
  return <WavelengthGame onExit={() => navigate("/play")} />;
}
