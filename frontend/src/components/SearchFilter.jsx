import { useState } from 'react';

/**
 * Search and Filter Component
 * Used for filtering lists with search and status filter
 */
const SearchFilter = ({ onSearch, onFilterChange, placeholder = 'Search...', filterOptions = null }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch?.(term);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        onFilterChange?.(status);
    };

    return (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}
        >
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '12px 38px 12px 16px',
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
                <span style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                }}>
                    🔍
                </span>
            </div>

            {/* Filter Dropdown */}
            {filterOptions && (
                <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                    <option value="all">All {filterOptions.label}</option>
                    {filterOptions.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default SearchFilter;
