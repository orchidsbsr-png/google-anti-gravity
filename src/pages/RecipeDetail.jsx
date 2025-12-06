import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import './RecipeDetail.css';

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
        <div className="recipe-detail-container">
            {/* Dynamic Blurred Background */}
            <div
                className="recipe-bg-fixed"
                style={{ backgroundImage: `url(${recipe.image})` }}
            />

            <div className="recipe-content-overlay">
                {/* Header / Nav Area */}
                <div className="recipe-nav">
                    <button className="back-button" onClick={() => navigate('/recipes')}>
                        ←
                    </button>
                    <div className="brand-pill">FruityBakes</div>
                    <button className="search-icon">🔍</button>
                </div>

                <div className="recipe-main-card glass-strong">

                    <div className="recipe-top-grid">
                        {/* LEFT COLUMN: Image & Header */}
                        <div className="recipe-hero-section">
                            <div className="hero-image-wrapper">
                                <img src={recipe.image} alt={recipe.title} />
                                <button className="heart-btn">♡</button>
                            </div>

                            <div className="recipe-header-info">
                                <h1>{recipe.title}</h1>
                                {recipe.chef && <h4 className="chef-credit">By {recipe.chef}</h4>}
                                <p className="recipe-short-desc">{recipe.description}</p>

                                {recipe.secret && (
                                    <div className="secret-box">
                                        <strong>💡 The Secret:</strong>
                                        <p>{recipe.secret}</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats Row */}
                            <div className="stats-row">
                                <div className="stat-box">
                                    <span className="stat-icon">⏱️</span>
                                    <span className="stat-val">{recipe.prepTime ? `Total: ${totalTime}` : 'N/A'}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-icon">🔥</span>
                                    <span className="stat-val">{recipe.calories || 'N/A'}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-icon">🥣</span>
                                    <span className="stat-val">{recipe.yields}</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Ingredients */}
                        <div className="ingredients-panel">
                            <h2>Grocery List</h2>
                            <div className="ingredients-scroll">
                                {Object.entries(recipe.ingredients).map(([section, items]) => (
                                    <div key={section}>
                                        {section !== 'Grocery List' && section !== 'Main' && section !== 'Filling' && <h4>{section}</h4>}
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
                                                            {isChecked && '✓'}
                                                        </div>
                                                        <span>{item}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: Instructions */}
                    <div className="instructions-panel">
                        <h2>Instructions</h2>
                        <div className="steps-list">
                            {recipe.instructions.map((step, index) => (
                                <div key={index} className="step-item">
                                    <span className="step-num">{index + 1}.</span>
                                    <p>{step.text}</p>
                                </div>
                            ))}
                        </div>

                        {recipe.videoUrl && (
                            <button
                                className="start-cooking-btn video-btn"
                                onClick={() => window.open(recipe.videoUrl, '_blank')}
                            >
                                <span>▶ Watch Video Tutorial</span>
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
