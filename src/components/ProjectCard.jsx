import React from "react";

export default function ProjectCard({ title, summary, tags = [] }) {
    return (
        <article className="project-card">
            <div className="card-media" aria-hidden>
                {/* placeholder image: replace with real thumbnail */}
                <div className="thumb">IMG</div>
            </div>

            <div className="card-body">
                <h3>{title}</h3>
                <p className="muted">{summary}</p>

                <div className="tags">
                    {tags.map((t) => (
                        <span key={t} className="tag">
                            {t}
                        </span>
                    ))}
                </div>

                <div className="card-actions">
                    <button className="btn">Read case study</button>
                    <button className="btn ghost">Live demo</button>
                </div>
            </div>
        </article>
    );
}
