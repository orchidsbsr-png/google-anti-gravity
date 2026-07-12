"use client";
import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ARTICLES } from '../data/articles';
import './InformationCentre.css';

export default function ArticleDetail() {
    const { slug } = useParams();
    const article = ARTICLES.find(a => a.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (article) document.title = `${article.title} — Naliban Farms`;
        return () => { document.title = 'Naliban Farms'; };
    }, [article]);

    if (!article) return <Navigate to="/information-centre" replace />;

    return (
        <main className="article-page">
            <header className="article-hero">
                <Link to="/information-centre" className="article-back">&larr; Information Centre</Link>
                <p className="info-eyebrow">{article.category} · {article.readMinutes} min read</p>
                <h1 className="article-title">{article.title}</h1>
            </header>

            <article className="article-body">
                {article.body.map((block, i) => {
                    if (block.h) return <h2 key={i}>{block.h}</h2>;
                    if (block.list) return (
                        <ul key={i}>
                            {block.list.map((li, j) => <li key={j}>{li}</li>)}
                        </ul>
                    );
                    return <p key={i}>{block.p}</p>;
                })}
            </article>

            <footer className="article-footer">
                <p>Written at the farm · Naliban Khatasu, Jubbal-Kotkhai</p>
                <Link to="/search" className="btn-terracotta">Shop the Harvest</Link>
            </footer>
        </main>
    );
}
