
/**
 * Configuration settings for chart appearance and behavior
 */
export interface ChartTheme {
  light: string;
  dark: string;
}

export interface ChartDataConfig {
  label: string;
  theme: ChartTheme;
}

export interface ChartTypeConfig {
  [key: string]: ChartDataConfig;
}

export const chartConfig: ChartTypeConfig = {
  views: {
    label: 'Vistas',
    theme: {
      light: '#0ea5e9',
      dark: '#0ea5e9',
    },
  },
  rentals: {
    label: 'Alquileres',
    theme: {
      light: '#10b981',
      dark: '#10b981',
    },
  },
};

// CSS variables for chart colors (can be referenced in stylesheets or components)
export const chartCssVariables = {
  '--color-views': '#0ea5e9',
  '--color-rentals': '#10b981',
};
