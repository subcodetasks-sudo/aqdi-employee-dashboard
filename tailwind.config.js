/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",

		// Or if using `src` directory:
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				14: '0.875rem',
				20: '1.25rem',
				32: '2rem',
			},
			fontSize: {
				10: ['0.625rem', { lineHeight: '0.875rem' }],
				11: ['0.6875rem', { lineHeight: '1rem' }],
				13: ['0.8125rem', { lineHeight: '1.125rem' }],
				15: ['0.9375rem', { lineHeight: '1.375rem' }],
				22: ['1.375rem', { lineHeight: '1.75rem' }],
			},
			spacing: {
				13: '3.25rem',
				'13.5': '3.375rem',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				brand: {
					main: '#0c6055',
					dark: '#0B5345',
					hover: '#0004E2',
					sec: '#453B2F',
					text: '#363636',
					accent: '#10B981',
					'accent-hover': '#0E9F6E',
				},
				sidebar: {
					DEFAULT: '#0D3B31',
					dark: '#08251F',
					hover: '#124436',
					foreground: '#E8F1EE',
				},
				surface: {
					DEFAULT: '#FFFFFF',
					muted: '#F3F3F3',
					'muted-hover': '#EEEEEE',
					input: '#F9F9F9',
					border: '#EEEEEE',
					'border-soft': '#E6EBE9',
				},
				ink: {
					heading: '#000000',
					body: '#424242',
					muted: '#686868',
					subtle: '#4D4D4D',
					placeholder: '#A3A3A3',
				},
				status: {
					success: { DEFAULT: '#10B981', bg: '#ECFDF5' },
					warning: { DEFAULT: '#F59E0B', bg: '#FFFBEB' },
					danger: { DEFAULT: '#EF4444', bg: '#FEF2F2' },
					neutral: { DEFAULT: '#6B7280', bg: '#F3F4F6' },
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}

