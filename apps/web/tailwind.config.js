/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', 'class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			brand: {
  				'50': '#FFF7ED',
  				'100': '#FFEDD5',
  				'200': '#FED7AA',
  				'300': '#FDBA74',
  				'400': '#FB923C',
  				'500': '#F97316',
  				'600': '#EA580C',
  				'700': '#C2410C',
  				'800': '#9A3412',
  				'900': '#7C2D12',
  				'950': '#431407'
  			},
  			primary: {
  				'50': '#FFF7ED',
  				'100': '#FFEDD5',
  				'200': '#FED7AA',
  				'300': '#FDBA74',
  				'400': '#FB923C',
  				'500': '#F97316',
  				'600': '#EA580C',
  				'700': '#C2410C',
  				'800': '#9A3412',
  				'900': '#7C2D12',
  				'950': '#431407',
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			accent: {
  				'50': '#FAF5FF',
  				'100': '#F3E8FF',
  				'200': '#E9D5FF',
  				'300': '#D8B4FE',
  				'400': '#C084FC',
  				'500': '#A855F7',
  				'600': '#9333EA',
  				'700': '#7C3AED',
  				'800': '#6B21A8',
  				'900': '#581C87',
  				'950': '#3B0764',
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			success: {
  				'50': '#F0FDF4',
  				'100': '#DCFCE7',
  				'500': '#22C55E',
  				'600': '#16A34A',
  				'700': '#15803D'
  			},
  			warning: {
  				'50': '#FFFBEB',
  				'100': '#FEF3C7',
  				'500': '#F59E0B',
  				'600': '#D97706',
  				'700': '#B45309'
  			},
  			error: {
  				'50': '#FEF2F2',
  				'100': '#FEE2E2',
  				'500': '#EF4444',
  				'600': '#DC2626',
  				'700': '#B91C1C'
  			},
  			neutral: {
  				'50': '#FAFAFA',
  				'100': '#F5F5F5',
  				'200': '#E5E5E5',
  				'300': '#D4D4D4',
  				'400': '#A3A3A3',
  				'500': '#737373',
  				'600': '#525252',
  				'700': '#404040',
  				'800': '#262626',
  				'900': '#171717',
  				'950': '#0A0A0A'
  			},
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)',
  				'muted-foreground': 'var(--sidebar-muted-foreground)'
  			}
  		},
  		fontFamily: {
			sans: [
				'var(--font-sans)',
				'system-ui',
				'sans-serif'
			],
			heading: [
				'var(--font-sans)',
				'system-ui',
				'sans-serif'
			],
			mono: [
				'var(--font-mono)',
				'monospace'
			]
  		},
  		fontSize: {
  			'2xs': [
  				'0.625rem',
  				{
  					lineHeight: '0.875rem'
  				}
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem'
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			brand: '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
  			card: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
  			'card-hover': '0 4px 16px 0 rgba(0, 0, 0, 0.12)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.5s ease-out',
  			'slide-down': 'slideDown 0.3s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
      require("tailwindcss-animate")
],
};
