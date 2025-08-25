import React, { useMemo, useState, useEffect } from 'react';
import './App.css';

/**
 * Recipe Explorer App
 * - Modern, minimalistic light UI
 * - Top NavBar, Sidebar with categories, Main content grid, Modal detail view
 * - Search by name/ingredient/category
 * - Favorite and rate recipes (persisted in localStorage)
 * - Responsive for desktop and mobile
 */

/* Data models */
/**
 * @typedef {Object} Recipe
 * @property {string} id
 * @property {string} title
 * @property {string} image
 * @property {string[]} categories
 * @property {string[]} ingredients
 * @property {string[]} steps
 * @property {number} rating Average rating 0..5
 * @property {number} timeMinutes
 */

/* In-memory demo dataset */
const DEMO_RECIPES = [
  {
    id: 'r1',
    title: 'Spicy Avocado Toast',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    categories: ['Breakfast', 'Vegetarian'],
    ingredients: ['2 slices sourdough', '1 ripe avocado', 'chili flakes', 'olive oil', 'salt', 'pepper', 'lemon juice'],
    steps: [
      'Toast sourdough to desired crispness.',
      'Mash avocado with salt, pepper, lemon juice.',
      'Spread on toast, drizzle with olive oil, sprinkle chili flakes.',
    ],
    rating: 4.3,
    timeMinutes: 10,
  },
  {
    id: 'r2',
    title: 'Creamy Tomato Pasta',
    image: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8bbf?w=800&q=80',
    categories: ['Lunch', 'Pasta', 'Vegetarian'],
    ingredients: ['200g penne', 'garlic', 'tomato sauce', 'cream', 'basil', 'parmesan', 'olive oil', 'salt'],
    steps: [
      'Cook pasta until al dente.',
      'Sauté garlic in olive oil, add tomato sauce and cream.',
      'Combine with pasta, top with basil and parmesan.',
    ],
    rating: 4.6,
    timeMinutes: 25,
  },
  {
    id: 'r3',
    title: 'Grilled Lemon Chicken',
    image: 'https://images.unsplash.com/photo-1604908553998-31a4b3c7f2a0?w=800&q=80',
    categories: ['Dinner', 'Grill'],
    ingredients: ['2 chicken breasts', 'lemon', 'garlic', 'olive oil', 'rosemary', 'salt', 'pepper'],
    steps: [
      'Marinate chicken with lemon juice, garlic, rosemary, oil, salt, pepper.',
      'Grill until fully cooked and charred.',
    ],
    rating: 4.2,
    timeMinutes: 30,
  },
  {
    id: 'r4',
    title: 'Berry Yogurt Parfait',
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80',
    categories: ['Breakfast', 'Dessert'],
    ingredients: ['Greek yogurt', 'mixed berries', 'granola', 'honey', 'mint'],
    steps: [
      'Layer yogurt, berries, and granola in a glass.',
      'Drizzle with honey and garnish with mint.',
    ],
    rating: 4.8,
    timeMinutes: 5,
  },
  {
    id: 'r5',
    title: 'Quinoa Veggie Bowl',
    image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&q=80',
    categories: ['Lunch', 'Vegan', 'Gluten-free'],
    ingredients: ['quinoa', 'roasted veggies', 'chickpeas', 'tahini', 'lemon', 'parsley', 'salt', 'pepper'],
    steps: [
      'Cook quinoa per package.',
      'Roast veggies, season chickpeas.',
      'Assemble bowl and drizzle with tahini lemon sauce.',
    ],
    rating: 4.5,
    timeMinutes: 35,
  },
];

/* Theme and color palette (light) applied via CSS variables in App.css */

/* Local storage utilities */
const LS_KEYS = {
  favorites: 'recipe_favorites_v1',
  ratings: 'recipe_ratings_v1',
};

// PUBLIC_INTERFACE
export function getStoredFavorites() {
  /** Retrieve favorites map from localStorage. */
  try {
    const raw = localStorage.getItem(LS_KEYS.favorites);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// PUBLIC_INTERFACE
export function setStoredFavorites(map) {
  /** Persist favorites map to localStorage. */
  try {
    localStorage.setItem(LS_KEYS.favorites, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function getStoredRatings() {
  /** Retrieve user ratings map from localStorage. */
  try {
    const raw = localStorage.getItem(LS_KEYS.ratings);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// PUBLIC_INTERFACE
export function setStoredRatings(map) {
  /** Persist user ratings map to localStorage. */
  try {
    localStorage.setItem(LS_KEYS.ratings, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/* Components */

// PUBLIC_INTERFACE
function NavBar({ query, onQueryChange, onClear, favoritesCount }) {
  /** Top navigation bar with brand, search input, and favorites indicator. */
  return (
    <header className="nav">
      <div className="brand">
        <span className="brand-mark">🍳</span>
        <span className="brand-name">Recipe Explorer</span>
      </div>
      <div className="search">
        <input
          aria-label="Search recipes"
          placeholder="Search by name, ingredient, or category"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button className="btn ghost" onClick={onClear} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>
      <div className="nav-actions">
        <span className="fav-pill" aria-label={`Favorites count ${favoritesCount}`}>
          ❤️ {favoritesCount}
        </span>
      </div>
    </header>
  );
}

// PUBLIC_INTERFACE
function Sidebar({ categories, active, onSelect }) {
  /** Category sidebar with an "All" option and badges. */
  return (
    <aside className="sidebar" aria-label="Recipe categories">
      <div className="sidebar-title">Categories</div>
      <button
        className={`chip ${active === 'All' ? 'active' : ''}`}
        onClick={() => onSelect('All')}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          className={`chip ${active === c ? 'active' : ''}`}
          onClick={() => onSelect(c)}
        >
          {c}
        </button>
      ))}
    </aside>
  );
}

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="stars" aria-label={`Rating ${value} out of 5`}>
      {'★'.repeat(full)}
      {half ? '☆' : ''}
      {'✩'.repeat(empty)}
    </div>
  );
}

// PUBLIC_INTERFACE
function RecipeCard({ recipe, isFavorite, onOpen, onToggleFav }) {
  /** Card with image, title, rating, categories, time and favorite toggle. */
  return (
    <div className="card" role="button" tabIndex={0} onClick={() => onOpen(recipe)} onKeyDown={(e)=>{ if(e.key==='Enter'){onOpen(recipe);} }}>
      <div className="image-wrap">
        <img src={recipe.image} alt={recipe.title} />
        <button
          className={`fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFav(recipe.id); }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          ❤️
        </button>
      </div>
      <div className="card-body">
        <div className="title-row">
          <h3 className="card-title">{recipe.title}</h3>
          <span className="time-pill">⏱ {recipe.timeMinutes}m</span>
        </div>
        <Stars value={recipe.rating} />
        <div className="tags">
          {recipe.categories.slice(0, 3).map((c) => (
            <span key={c} className="tag">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function RecipeGrid({ recipes, favoritesMap, onOpen, onToggleFav }) {
  /** Responsive grid of recipe cards. */
  if (!recipes.length) {
    return <div className="empty">No recipes found. Try a different search or category.</div>;
  }
  return (
    <div className="grid">
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          isFavorite={!!favoritesMap[r.id]}
          onOpen={onOpen}
          onToggleFav={onToggleFav}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function RatingSelector({ value, onChange }) {
  /** Interactive 1..5 star rating input. */
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="rating-selector" aria-label="Rate this recipe">
      {stars.map((s) => (
        <button
          key={s}
          className={`star ${s <= (hover || value) ? 'on' : ''}`}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function RecipeModal({ recipe, onClose, userRating, onRate, isFavorite, onToggleFav }) {
  /** Modal with full recipe details, ingredients, steps, and rating control. */
  if (!recipe) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <button className="close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-header">
          <img src={recipe.image} alt={recipe.title} />
          <div className="modal-header-info">
            <h2>{recipe.title}</h2>
            <div className="meta">
              <span className="time-pill">⏱ {recipe.timeMinutes}m</span>
              <Stars value={recipe.rating} />
              <button
                className={`fav-toggle ${isFavorite ? 'active' : ''}`}
                onClick={() => onToggleFav(recipe.id)}
              >
                {isFavorite ? '❤️ Favorited' : '🤍 Add Favorite'}
              </button>
            </div>
            <div className="tags">
              {recipe.categories.map((c) => (
                <span key={c} className="tag">{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-content">
          <section>
            <h3>Ingredients</h3>
            <ul className="ingredients">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Steps</h3>
            <ol className="steps">
              {recipe.steps.map((st, idx) => (
                <li key={idx}>{st}</li>
              ))}
            </ol>
          </section>
          <section className="rate-section">
            <h3>Your Rating</h3>
            <RatingSelector value={userRating || 0} onChange={onRate} />
            {userRating ? <p className="muted">You rated this {userRating} / 5</p> : <p className="muted">Not rated yet</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Main entry renders the full recipe explorer experience. */
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [ratings, setRatings] = useState({});

  // Load from localStorage once
  useEffect(() => {
    setFavorites(getStoredFavorites());
    setRatings(getStoredRatings());
  }, []);

  // Derive unique categories from data
  const categories = useMemo(() => {
    const set = new Set();
    DEMO_RECIPES.forEach((r) => r.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, []);

  // Filtering logic by query and category
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_RECIPES.filter((r) => {
      const matchesCategory = activeCategory === 'All' || r.categories.includes(activeCategory);
      if (!q) return matchesCategory;
      const hay = [
        r.title,
        ...r.categories,
        ...r.ingredients,
      ].join(' ').toLowerCase();
      return matchesCategory && hay.includes(q);
    });
  }, [query, activeCategory]);

  // Favorites handlers
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      setStoredFavorites(next);
      return next;
    });
  };

  // Rating handlers
  const handleRate = (id, value) => {
    setRatings((prev) => {
      const next = { ...prev, [id]: value };
      setStoredRatings(next);
      return next;
    });
  };

  // UI handlers
  const openRecipe = (r) => setSelected(r);
  const closeModal = () => setSelected(null);

  return (
    <div className="app-root">
      <NavBar
        query={query}
        onQueryChange={setQuery}
        onClear={() => setQuery('')}
        favoritesCount={Object.keys(favorites).length}
      />
      <div className="layout">
        <Sidebar
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
        <main className="content">
          <div className="content-header">
            <h2>{activeCategory === 'All' ? 'All Recipes' : activeCategory}</h2>
            {query && <span className="muted">Searching for “{query}”</span>}
          </div>
          <RecipeGrid
            recipes={filtered}
            favoritesMap={favorites}
            onOpen={openRecipe}
            onToggleFav={toggleFavorite}
          />
        </main>
      </div>

      <RecipeModal
        recipe={selected}
        onClose={closeModal}
        userRating={selected ? ratings[selected.id] : 0}
        onRate={(val) => selected && handleRate(selected.id, val)}
        isFavorite={selected ? !!favorites[selected.id] : false}
        onToggleFav={toggleFavorite}
      />
    </div>
  );
}

export default App;
