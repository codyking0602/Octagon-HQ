import { NavLink } from "react-router-dom";

const destinations = [
  { to: "/", label: "Home", end: true },
  { to: "/rankings", label: "Rankings", end: false },
  { to: "/play", label: "Play", end: false },
  { to: "/picks", label: "Picks", end: false },
] as const;

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {destinations.map((destination) => (
        <NavLink
          key={destination.to}
          to={destination.to}
          end={destination.end}
          className={({ isActive }) => (isActive ? "bottom-nav__item is-active" : "bottom-nav__item")}
        >
          <span className="bottom-nav__indicator" aria-hidden="true" />
          <span>{destination.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
