import React, { useState } from 'react';

/**
 * StarRating Component
 * @param {number}   value     - current rating (1-5)
 * @param {function} onChange  - called with new rating when user clicks (omit for readonly)
 * @param {number}   size      - font-size of each star in px  (default 20)
 * @param {boolean}  readonly  - if true, no hover/click interaction
 */
const StarRating = ({ value = 0, onChange, size = 20, readonly = false }) => {
    const [hovered, setHovered] = useState(0);

    const display = hovered || value;

    const starStyle = (i) => ({
        fontSize: `${size}px`,
        cursor: readonly ? 'default' : 'pointer',
        color: i <= display ? '#f5a623' : '#d1d5db',
        transition: 'color 0.15s ease',
        lineHeight: 1,
        userSelect: 'none',
    });

    return (
        <span
            style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}
            onMouseLeave={() => !readonly && setHovered(0)}
        >
            {[1, 2, 3, 4, 5].map(i => (
                <span
                    key={i}
                    style={starStyle(i)}
                    onMouseEnter={() => !readonly && setHovered(i)}
                    onClick={() => !readonly && onChange && onChange(i)}
                    aria-label={`${i} star${i > 1 ? 's' : ''}`}
                >
                    ★
                </span>
            ))}
        </span>
    );
};

export default StarRating;
