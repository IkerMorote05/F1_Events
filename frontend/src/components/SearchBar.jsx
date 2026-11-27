import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({
  value = '',
  placeholder = 'Buscar en el catálogo...',
  ariaLabel = 'Buscar en el catálogo',
  buttonLabel = 'Buscar',
  debounceMs = 300,
  onSearch
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.trim() === value.trim()) return undefined;
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [debounceMs, inputValue, onSearch, value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(inputValue);
  };

  return (
    <form className="home-search-form" onSubmit={handleSubmit} role="search">
      <div className="home-search-input-wrap">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
      </div>
      <button type="submit" className="btn-primary home-search-submit">
        {buttonLabel}
      </button>
    </form>
  );
};
