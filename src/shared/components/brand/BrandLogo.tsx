import * as React from 'react';

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'full' | 'symbol' | 'vertical';
  symbolColor?: string;
  textColor?: string;
  subtitleColor?: string;
}

/**
 * The Beverage — Official Brand Logo Component
 *
 * Concept B: The Artisan Woodblock Seal
 * Represents artisanal tea & coffee craftsmanship with a ceramic tasting vessel
 * and suspended essence droplet carved out in geometric negative space.
 */
export function BrandLogo({
  variant = 'full',
  symbolColor = '#C25E2E',
  textColor = 'currentColor',
  subtitleColor = '#71717A',
  className = 'h-8 w-auto',
  ...props
}: BrandLogoProps) {
  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="The Beverage Logo"
        {...props}
      >
        <path
          fill={symbolColor}
          fillRule="evenodd"
          d="
            M 128 16
            A 112 112 0 1 1 127.9 16
            Z
            M 74 116
            L 182 116
            C 182 166 156 196 128 196
            C 100 196 74 166 74 116
            Z
            M 90 208
            L 166 208
            C 170 208 172 210 172 213
            C 172 216 170 218 166 218
            L 90 218
            C 86 218 84 216 84 213
            C 84 210 86 208 90 208
            Z
            M 128 46
            C 134 58 144 68 144 80
            A 16 16 0 1 1 112 80
            C 112 68 122 58 128 46
            Z
          "
        />
      </svg>
    );
  }

  if (variant === 'vertical') {
    return (
      <svg
        viewBox="0 0 460 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="The Beverage Logo"
        {...props}
      >
        <g transform="translate(110, 20)">
          <path
            fill={symbolColor}
            fillRule="evenodd"
            d="
              M 128 16 A 112 112 0 1 1 127.9 16 Z
              M 74 116 L 182 116 C 182 166 156 196 128 196 C 100 196 74 166 74 116 Z
              M 90 208 L 166 208 C 170 208 172 210 172 213 C 172 216 170 218 166 218 L 90 218 C 86 218 84 216 84 213 C 84 210 86 208 90 208 Z
              M 128 46 C 134 58 144 68 144 80 A 16 16 0 1 1 112 80 C 112 68 122 58 128 46 Z
            "
          />
        </g>
        <text
          x="230"
          y="315"
          textAnchor="middle"
          fontFamily="'Playfair Display', 'Cinzel', 'Baskerville', 'Georgia', serif"
          fontSize="36"
          fontWeight="700"
          letterSpacing="2"
          fill={textColor}
        >
          THE BEVERAGE
        </text>
        <text
          x="230"
          y="348"
          textAnchor="middle"
          fontFamily="'Inter', -apple-system, sans-serif"
          fontSize="12"
          fontWeight="500"
          letterSpacing="4"
          fill={subtitleColor}
        >
          HANDCRAFTED TASTE &amp; PURITY
        </text>
      </svg>
    );
  }

  // Default: 'full' horizontal lockup
  return (
    <svg
      viewBox="0 0 980 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="The Beverage Logo"
      {...props}
    >
      <g transform="translate(24, 0)">
        <path
          fill={symbolColor}
          fillRule="evenodd"
          d="
            M 128 16 A 112 112 0 1 1 127.9 16 Z
            M 74 116 L 182 116 C 182 166 156 196 128 196 C 100 196 74 166 74 116 Z
            M 90 208 L 166 208 C 170 208 172 210 172 213 C 172 216 170 218 166 218 L 90 218 C 86 218 84 216 84 213 C 84 210 86 208 90 208 Z
            M 128 46 C 134 58 144 68 144 80 A 16 16 0 1 1 112 80 C 112 68 122 58 128 46 Z
          "
        />
      </g>
      <text
        x="290"
        y="130"
        fontFamily="'Playfair Display', 'Cinzel', 'Baskerville', 'Georgia', serif"
        fontSize="52"
        fontWeight="700"
        letterSpacing="3"
        fill={textColor}
      >
        THE BEVERAGE
      </text>
      <text
        x="294"
        y="172"
        fontFamily="'Inter', -apple-system, sans-serif"
        fontSize="15"
        fontWeight="500"
        letterSpacing="6"
        fill={subtitleColor}
      >
        HANDCRAFTED TASTE &amp; PURITY
      </text>
    </svg>
  );
}
