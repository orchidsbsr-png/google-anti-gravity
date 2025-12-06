import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipes } from '../data/recipes';
import './Recipes.css';

const Recipes = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', 'Apple', 'Pear', 'Kiwi', 'Cherry', 'Persimmon'];

    // Filter recipes based on active tab
    const filteredRecipes = activeTab === 'All'
        ? recipes
        : recipes.filter(r => r.fruitType === activeTab);

    return (
        <div className="recipes-page">
            <header className="recipes-header glass">
                <h1>Farm Fresh Recipes</h1>
                <p>Select a fruit to see delicious ideas</p>

                <div className="category-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
                            onClick={() => setActiveTab(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <div className="recipes-grid">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <div
                            key={recipe.id}
                            className="recipe-card glass"
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                        >
                            <div className="recipe-image-container">
                                <img src={recipe.image} alt={recipe.title} loading="lazy" />
                                <span className="recipe-badge">{recipe.fruitType}</span>
                            </div>
                            <div className="recipe-content">
                                <h3>{recipe.title}</h3>
                                <p className="recipe-desc">{recipe.description}</p>
                                <div className="recipe-meta">
                                    <span>⏱️ {recipe.prepTime}</span>
                                    <span>🔥 {recipe.calories || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <h3>No recipes found for {activeTab} yet! 🍎</h3>
                        <p>We are currently gathering the best recipes for you.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recipes;
