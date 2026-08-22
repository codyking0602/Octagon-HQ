import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "../../components/BrandMark";

const DISCOVERY_KEY = "octagon-hq.back-room.discovered.v1";
export const BACK_ROOM_LONG_PRESS_MS = 1200;

function hasDiscoveredBackRoom() {
  try {
    return window.localStorage.getItem(DISCOVERY_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberBackRoomDiscovery() {
  try {
    window.localStorage.setItem(DISCOVERY_KEY, "1");
  } catch {
    // Discovery still works when storage is unavailable.
  }
}

export function BackRoomLogoLink({ enabled }: { enabled: boolean }) {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const activatedRef = useRef(false);
  const [arming, setArming] = useState(false);

  function cancelPress() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setArming(false);
  }

  function startPress() {
    if (!enabled) return;
    cancelPress();
    activatedRef.current = false;
    setArming(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const showDiscovery = !hasDiscoveredBackRoom();
      rememberBackRoomDiscovery();
      activatedRef.current = true;
      setArming(false);
      navigate("/back-room", { state: showDiscovery ? { showDiscovery: true } : null });
    }, BACK_ROOM_LONG_PRESS_MS);
  }

  return (
    <Link
      className={`back-room-entry${arming ? " is-arming" : ""}`}
      to="/"
      aria-label="Return to Home"
      style={{ textDecoration: "none" }}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onPointerLeave={cancelPress}
      onContextMenu={(event) => {
        if (enabled) event.preventDefault();
      }}
      onClick={(event) => {
        if (!activatedRef.current) return;
        event.preventDefault();
        activatedRef.current = false;
      }}
    >
      <BrandMark size="compact" />
    </Link>
  );
}
