import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recipes } from '../data/recipes';
import LazyVideo from '../components/LazyVideo';
import './Recipes.css';

const Recipes = () => {
    // Separate the Hero recipe (Cherry Clafoutis) from the rest
    const heroRecipe = recipes.find(r => r.id === 'cherry-clafoutis-hero');
    const otherRecipes = recipes.filter(r => r.id !== 'cherry-clafoutis-hero');

    const handleAddBundle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Mock "Scenario 3" Action
        alert("🍒 Mountain Cherry Bundle added to your cart! ($12.50)");
    };

    useEffect(() => {
        // Floating animation effect on scroll could be enhanced here
        // For now, handled via CSS animations
    }, []);

    // Split recipes for masonry columns (if not using CSS columns)
    // Using CSS columns is easier for true masonry.

    return (
        <div className="antigravity-kitchen">
            {/* Ethereal Background */}
            <div className="alpine-backdrop"></div>

            <div className="kitchen-content">
                <header className="kitchen-header">
                    <h1 className="fade-in-up">The Elevated Kitchen</h1>
                    <p className="subtitle fade-in-up delay-1">Antigravity Recipes</p>
                </header>

                <div className="masonry-grid">
                    {/* HERO CARD - Spans full width or distinct position */}
                    {heroRecipe && (
                        <Link to={`/recipes/${heroRecipe.id}`} className="recipe-card hero-card float-animation">
                            <div className="card-media">
                                <LazyVideo
                                    src={`/videos/${heroRecipe.title.toLowerCase().replace(/ /g, '-')}.mp4`}
                                    poster={heroRecipe.image}
                                    className="recipe-video"
                                />
                                <div className="play-icon">▶</div>
                                <div className="steam-effect"></div>
                            </div>
                            <div className="card-info">
                                <h2>{heroRecipe.title}</h2>
                                <p className="chef-name">by {heroRecipe.chef}</p>

                                {/* Scenario 3 UI Module */}
                                <div className="bundle-module glass">
                                    <div className="bundle-icon">🍒</div>
                                    <div className="bundle-text">
                                        <span>Needs ~1kg Mountain Cherries</span>
                                        <button onClick={handleAddBundle} className="btn-apricot">
                                            Add Bundle • $12.50
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* STANDARD CARDS */}
                    {otherRecipes.map((recipe, index) => {
                        // Apply custom layout specific to the "Antigravity Kitchen" prompt
                        let cardStyle = "standard-card";
                        if (recipe.title.includes("Kiwi Juice")) cardStyle = "portrait-card";
                        if (recipe.title.includes("Apple Crisp")) cardStyle = "landscape-card";

                        return (
                            <Link
                                to={`/recipes/${recipe.id}`}
                                key={recipe.id}
                                className={`recipe-card ${cardStyle} float-animation delay-${index % 3}`}
                            >
                                <div className="card-media">
                                    <LazyVideo
                                        src={`/videos/${recipe.title.toLowerCase().replace(/ /g, '-')}.mp4`}
                                        poster={recipe.image}
                                        className="recipe-video"
                                    />
                                    <div className="play-icon">▶</div>
                                </div>
                                <div className="card-info-minimal">
                                    <h3>{recipe.title}</h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Recipes;
