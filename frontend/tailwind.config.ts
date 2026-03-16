import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			'classivo-black': '#000000',
    			'classivo-dark-grey': '#09090b',
    			'classivo-grey': '#18181b',
    			'classivo-light-grey': '#27272a',
    			'classivo-text-grey': '#a1a1aa',
    			'classivo-white': '#e4e4e7',
    			'classivo-pure-white': '#ffffff',
    			'premium-gold': '#D4AF37',
    			'premium-obsidian': '#0D0D0D',
    			'premium-slate': '#1C1C1E',
    			'emerald-signal': '#D4AF37', // Replacing emerald with Gold for premium feel
    			'danger-signal': '#ef4444',
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
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    		},
			keyframes: {
         			shine: {
           				'0%': { 'background-position': '100%' },
          				'100%': { 'background-position': '-100%' },
        			},
       		},
       		animation: {
        		shine: 'shine 5s linear infinite',
       		},
    		fontFamily: {
    			sans: [
    				'var(--font-ordina)',
    				'var(--font-space-grotesk)',
    				'system-ui',
    				'sans-serif'
    			],
    			display: [
    				'var(--font-ordina)',
    				'var(--font-space-grotesk)',
    				'system-ui',
    				'sans-serif'
    			],
    			mono: [
    				'var(--font-geist-mono)',
    				'monospace'
    			]
    		},
    		boxShadow: {
    			'glow-gold': '0 0 20px rgba(212, 175, 55, 0.15)',
    			'glow-red': '0 0 20px rgba(239, 68, 68, 0.15)'
    		},
    		backgroundImage: {
    			'void-gradient': 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15) 0%, rgba(9, 9, 11, 0) 60%), #09090b'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;