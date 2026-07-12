"use client";
import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

// "You are here" trail — each crumb sits in its own container, the
// current page is highlighted and unlinked.
// trail: [{ label, to }, ..., { label }]  (last item = current page)
export default function Breadcrumbs({ trail, onDark = false }) {
    return (
        <nav className={`crumbs ${onDark ? 'on-dark' : ''}`} aria-label="You are here">
            {trail.map((c, i) => (
                <span className="crumb-seg" key={`${c.label}-${i}`}>
                    {c.to ? (
                        <Link to={c.to} className="crumb-box">{c.label}</Link>
                    ) : (
                        <span className="crumb-box current" aria-current="page">{c.label}</span>
                    )}
                    {i < trail.length - 1 && (
                        <svg className="crumb-arrow" aria-hidden="true" width="11" height="11" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    )}
                </span>
            ))}
        </nav>
    );
}
