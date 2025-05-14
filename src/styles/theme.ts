// src/styles/theme.ts
export const theme = {
  colors: {
    primary: '#6D28D9', // Example: Antiapp Purple (Tailwind violet-700)
    secondary: '#4F46E5', // Example: Antiapp Indigo (Tailwind indigo-600)
    // Add other theme colors if needed by other styled-components
  },
  // You can add other theme properties here like fonts, spacing, etc.
  // e.g., fonts: ['sans-serif', 'Roboto'],
  // e.g., fontSizes: {
  //   small: '1em',
  //   medium: '2em',
  //   large: '3em',
  // }
};

export type AppTheme = typeof theme; // Exporting the theme type for use in styled.d.ts
