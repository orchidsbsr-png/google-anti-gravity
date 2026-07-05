import React from 'react';
import { Link } from 'react-router-dom';
import { recipes } from '../data/recipes';
import LazyVideo from '../components/LazyVideo';
import './Recipes.css';

const Recipes = () => {
    // Featured recipe leads the page; the rest flow in the grid
    const heroRecipe = recipes.find(r => r.id === 'cherry-clafoutis-hero') || recipes[0];
    const otherRecipes = recipes.filter(r => r.id !== heroRecipe.id);

    return (
        <div className="kitchen-page">
            <header className="kitchen-header">
                <p className="kitchen-eyebrow">The Kitchen</p>
                <h1 className="kitchen-title">
                    Cooked slow, <em>like the seasons.</em>
                </h1>
                <p className="kitchen-sub">
                    What our family makes when the harvest comes home &mdash; recipes
                    for every fruit we grow.
                </p>
            </header>

            {/* Featured recipe */}
            <Link to={`/recipes/${heroRecipe.id}`} className="featured-recipe">
                <div className="featured-media">
                    <LazyVideo
                        src={`/videos/${heroRecipe.title.toLowerCase().replace(/ /g, '-')}.mp4`}
                        poster={heroRecipe.image}
                        className="recipe-video"
                    />
                </div>
                <div className="featured-info">
                    <span className="featured-tag">Featured &middot; {heroRecipe.fruitType || 'Seasonal'}</span>
                    <h2>{heroRecipe.title}</h2>
                    {heroRecipe.chef && <p className="recipe-chef">by {heroRecipe.chef}</p>}
                    <p className="featured-desc">{heroRecipe.description}</p>
                    <div className="recipe-meta">
                        {heroRecipe.prepTime && <span>{heroRecipe.prepTime} prep</span>}
                        {heroRecipe.cookTime && <span>{heroRecipe.cookTime} cook</span>}
                        {heroRecipe.difficulty && <span>{heroRecipe.difficulty}</span>}
                    </div>
                    <span className="featured-cta">Open the recipe &rarr;</span>
                </div>
            </Link>

            {/* Grid */}
            <div className="recipes-grid">
                {otherRecipes.map((recipe, index) => (
                    <Link
                        to={`/recipes/${recipe.id}`}
                        key={recipe.id}
                        className="recipe-card"
                    >
                        <div className="card-media">
                            <LazyVideo
                                src={`/videos/${recipe.title.toLowerCase().replace(/ /g, '-')}.mp4`}
                                poster={recipe.image}
                                className="recipe-video"
                            />
                            <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="card-info">
                            <span className="card-fruit">{recipe.fruitType || 'Seasonal'}</span>
                            <h3>{recipe.title}</h3>
                            <div className="recipe-meta">
                                {recipe.cookTime && <span>{recipe.cookTime}</span>}
                                {recipe.difficulty && <span>{recipe.difficulty}</span>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Recipes;
