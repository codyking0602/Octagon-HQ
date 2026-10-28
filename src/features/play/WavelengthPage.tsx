import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WavelengthGame from "./WavelengthGame";

export default function WavelengthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const challengeSeed = useMemo(() => {
    const value = new URLSearchParams(location.search).get("challenge") ?? "";
    return /^[a-z0-9-]{3,80}$/i.test(value) ? value : undefined;
  }, [location.search]);

  return <WavelengthGame challengeSeed={challengeSeed} onExit={() => navigate("/play")} />;
}
