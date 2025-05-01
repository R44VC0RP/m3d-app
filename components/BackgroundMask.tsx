import React from 'react'

const BackgroundMask: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1850 998"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="blur-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="60" />
      </filter>
      <filter id="noise-filter" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="4" />
      </filter>
      <mask id="mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1850" height="998">
        <path
          d="m1722 839.526v-739.526c0-55.2285-44.77-100-100-100h-697-697c-55.228 0-100 44.7715-100 100v898l8.722-166.333 66.038-414.347c.829-5.205 1.246-10.468 1.246-15.739v-224.498c0-45.518 30.739-85.2924 74.786-96.7692l204.585-53.3064c6.399-1.6675 12.949-2.696 19.552-3.0705l422.071-23.9369 494.46 23.8237c9.32.4486 18.52 2.1974 27.35 5.1954l140.58 47.741c40.56 13.7746 67.84 51.8529 67.84 94.6889v230.192c0 5.231.41 10.455 1.23 15.622l64.31 406.641c.82 5.167 1.23 10.391 1.23 15.622z"
          fill="white"
          filter="url(#blur-filter)"
        />
      </mask>
    </defs>
    {/* Procedural noise background */}
    <rect
      width="1850"
      height="998"
      fill="white"
      filter="url(#noise-filter)"
      mask="url(#mask)"
      className="mix-blend-overlay"
    />
    <rect
      width="1850"
      height="998"
      fill="#466F80"
      fillOpacity={0.60}
      mask="url(#mask)"
    />
  </svg>
)

export default BackgroundMask 