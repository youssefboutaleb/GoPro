
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  value?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  value = "",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(value);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    if (onClear) {
      onClear();
    } else {
      onSearch("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Button onClick={handleSearch} size="sm">
        Search
      </Button>
    </div>
  );
};

export default SearchBar;
