import { Link } from "react-router-dom";
import {
  formatWhatsNewAge,
  whatsNewCategoryLabel,
} from "./whatsNewModel";
import { useWhatsNew } from "./WhatsNewProvider";

export function WhatsNewPreview() {
  const whatsNew = useWhatsNew();
  const item = whatsNew.latestItem;

  if (!item) return null;

  return (
    <section className="surface-card whats-new-preview" aria-labelledby="whats-new-preview-title">
      <div className="whats-new-preview__heading">
        <div>
          <p className="eyebrow">LATEST FROM HQ</p>
          <h2 id="whats-new-preview-title">What&apos;s New</h2>
        </div>
        {whatsNew.unreadCount > 0 ? (
          <span>{whatsNew.unreadCount > 9 ? "9+" : whatsNew.unreadCount} NEW</span>
        ) : null}
      </div>

      <Link className="whats-new-preview__item" to={item.route ?? "/whats-new"}>
        <span className="whats-new-preview__mark" aria-hidden="true">✦</span>
        <span className="whats-new-preview__copy">
          <small>{whatsNewCategoryLabel(item.category)} · {formatWhatsNewAge(item.publishedAt)}</small>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
        </span>
        <b aria-hidden="true">›</b>
      </Link>

      <Link className="whats-new-preview__all" to="/whats-new">
        VIEW ALL UPDATES →
      </Link>
    </section>
  );
}
