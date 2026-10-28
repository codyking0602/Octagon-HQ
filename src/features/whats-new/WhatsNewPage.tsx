import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  formatWhatsNewAge,
  whatsNewCategoryLabel,
  type WhatsNewItem,
} from "./whatsNewModel";
import { useWhatsNew } from "./WhatsNewProvider";

function FeedItem({ item }: { item: WhatsNewItem }) {
  const body = (
    <>
      <span className="whats-new-item__mark" aria-hidden="true">✦</span>
      <span className="whats-new-item__body">
        <span className="whats-new-item__meta">
          <small>{whatsNewCategoryLabel(item.category)}</small>
          <time dateTime={item.publishedAt}>{formatWhatsNewAge(item.publishedAt)}</time>
          {!item.isRead ? <b>NEW</b> : null}
        </span>
        <strong>{item.title}</strong>
        <p>{item.summary}</p>
        {item.actionLabel ? <em>{item.actionLabel} →</em> : null}
      </span>
      {item.route ? <span className="whats-new-item__chevron" aria-hidden="true">›</span> : null}
    </>
  );

  return item.route ? (
    <Link className="whats-new-item" to={item.route}>{body}</Link>
  ) : (
    <article className="whats-new-item">{body}</article>
  );
}

function FeedSection({ title, eyebrow, children }: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="surface-card whats-new-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="whats-new-list">{children}</div>
    </section>
  );
}

export default function WhatsNewPage() {
  const whatsNew = useWhatsNew();

  useEffect(() => {
    if (whatsNew.status === "ready" && whatsNew.unreadCount > 0) {
      void whatsNew.markAllRead();
    }
  }, [whatsNew.markAllRead, whatsNew.status, whatsNew.unreadCount]);

  return (
    <div className="page whats-new-page">
      <section className="page-heading">
        <p className="eyebrow">OCTAGON HQ ACTIVITY</p>
        <h1>What&apos;s New</h1>
        <p>Meaningful rankings, Picks, games, fighters, and community updates in one place.</p>
      </section>

      {whatsNew.error ? <div className="whats-new-error" role="status">{whatsNew.error}</div> : null}

      {whatsNew.status === "loading" && !whatsNew.items.length ? (
        <section className="surface-card whats-new-empty"><strong>Loading updates…</strong></section>
      ) : !whatsNew.items.length ? (
        <section className="surface-card whats-new-empty">
          <strong>You&apos;re caught up.</strong>
          <span>Meaningful Octagon HQ updates will appear here.</span>
        </section>
      ) : (
        <>
          {whatsNew.activeItems.length ? (
            <FeedSection eyebrow="ACTIVE FOR 7 DAYS" title="Latest">
              {whatsNew.activeItems.map((item) => <FeedItem item={item} key={item.id} />)}
            </FeedSection>
          ) : null}

          {whatsNew.archiveItems.length ? (
            <FeedSection eyebrow="DAYS 8–15" title="Archive">
              {whatsNew.archiveItems.map((item) => <FeedItem item={item} key={item.id} />)}
            </FeedSection>
          ) : null}
        </>
      )}
    </div>
  );
}
