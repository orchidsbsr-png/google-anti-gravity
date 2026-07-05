import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { LogoMark } from '../components/Logo';
import './RecipeDetail.css';

const metaIconProps = {
    width: 15,
    height: 15,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

const MetaIcons = {
    clock: (
        <svg {...metaIconProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    ),
    flame: (
        <svg {...metaIconProps}>
            <path d="M12 3c1 3-3 5-3 9a5 5 0 0 0 10 0c0-2-1-3.5-2-5-1 1.5-2 2-2.5 1.5C15.5 7 14 5 12 3z" />
        </svg>
    ),
    bowl: (
        <svg {...metaIconProps}>
            <path d="M4 11h16a8 8 0 0 1-16 0z" />
            <path d="M9 11c0-4 1.5-6 4-8" />
        </svg>
    ),
};

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const recipe = recipes.find(r => r.id === id);
    const [checkedIngredients, setCheckedIngredients] = useState({});

    if (!recipe) return null;

    const toggleIngredient = (idx) => {
        setCheckedIngredients(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    // Calculate total time safely (simple sum of strings)
    const totalTime = (parseInt(recipe.prepTime) || 0) + (parseInt(recipe.cookTime) || 0) + " mins";

    return (
        <div className="recipe-detail-page">
            {/* Top bar */}
            <div className="recipe-nav">
                <button className="back-button" onClick={() => navigate('/recipes')} aria-label="Back to Kitchen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                    </svg>
                    The Kitchen
                </button>
                <span className="recipe-nav-logo"><LogoMark size={34} /></span>
            </div>

            {/* Hero */}
            <header className="recipe-hero">
                <div className="recipe-hero-media">
                    <img src={recipe.image} alt={recipe.title} />
                </div>
                <div className="recipe-hero-info">
                    <span className="recipe-fruit-tag">{recipe.fruitType || 'Seasonal'} &middot; {recipe.difficulty || 'Easy'}</span>
                    <h1>{recipe.title}</h1>
                    {recipe.chef && <p className="chef-credit">by {recipe.chef}</p>}
                    <p className="recipe-short-desc">{recipe.description}</p>

                    <div className="stats-row">
                        <div className="stat-box">
                            {MetaIcons.clock}
                            <span>{recipe.prepTime ? totalTime : 'N/A'}</span>
                        </div>
                        <div className="stat-box">
                            {MetaIcons.flame}
                            <span>{recipe.calories || 'N/A'}</span>
                        </div>
                        <div className="stat-box">
                            {MetaIcons.bowl}
                            <span>{recipe.yields}</span>
                        </div>
                    </div>

                    {recipe.secret && (
                        <div className="secret-box">
                            <span className="secret-label">The Secret</span>
                            <p>{recipe.secret}</p>
                        </div>
                    )}
                </div>
            </header>

            {/* Ingredients + Instructions */}
            <div className="recipe-body">
                <aside className="ingredients-panel">
                    <h2>Grocery <em>List</em></h2>
                    {Object.entries(recipe.ingredients).map(([section, items]) => (
                        <div key={section}>
                            {section !== 'Grocery List' && section !== 'Main' && section !== 'Filling' && (
                                <h4 className="ingredient-section">{section}</h4>
                            )}
                            <ul className="clean-list">
                                {items.map((item, index) => {
                                    const key = `${section}-${index}`;
                                    const isChecked = checkedIngredients[key];
                                    return (
                                        <li
                                            key={key}
                                            className={isChecked ? 'checked' : ''}
                                            onClick={() => toggleIngredient(key)}
                                        >
                                            <div className={`check-circle ${isChecked ? 'active' : ''}`}>
                                                {isChecked && (
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 6L9 17l-5-5" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </aside>

                <section className="instructions-panel">
                    <h2>The <em>Method</em></h2>
                    <div className="steps-list">
                        {recipe.instructions.map((step, index) => (
                            <div key={index} className="step-item">
                                <span className="step-num">{String(index + 1).padStart(2, '0')}</span>
                                <p>{step.text}</p>
                            </div>
                        ))}
                    </div>

                    {recipe.videoUrl && (
                        <button
                            className="btn-primary watch-video-btn"
                            onClick={() => window.open(recipe.videoUrl, '_blank')}
                        >
                            Watch the Video Tutorial
                        </button>
                    )}
                </section>
            </div>
        </div>
    );
};

export default RecipeDetail;
