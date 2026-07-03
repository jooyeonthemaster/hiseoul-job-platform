/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-paperlogy)', '"Pretendard Variable"', 'Pretendard', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-paperlogy)', '"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Brand primary: azure (하늘·청록빛 파랑) ──
        azure: {
          50: '#F0F7FF',
          100: '#DEEEFF',
          200: '#BEDDFF',
          300: '#93C6FF',
          400: '#5EA8FB',
          500: '#3B8AF0',
          600: '#2570D4',
          700: '#1D59AC',
          800: '#1B4A89',
          900: '#1B3F70',
          950: '#13294D',
        },
        // ── Cool sky highlight (보조) ──
        'sky-cool': {
          200: '#CDECFB',
          300: '#A7DCF6',
          400: '#6FC6EE',
          500: '#3FAEE0',
          600: '#2C90BE',
        },
        // ── Ink: cool slate-navy 중립/텍스트 ──
        ink: {
          50: '#F4F7FB',
          100: '#E3EAF3',
          200: '#C9D4E3',
          300: '#A7B6CB',
          400: '#8595AC',
          500: '#5A6B85',
          600: '#41526C',
          700: '#2C415F',
          800: '#19304B',
          900: '#0E1F38',
        },
        // ── 상태색 (절제, 낮은 채도) ──
        mint: { 100: '#D6F5EF', 400: '#3FCDB8', 500: '#22B8A6', 600: '#159484' },
        honey: { 100: '#FBEBCF', 400: '#EEB45C', 500: '#E8A33D', 600: '#C9842A' },
        coral: { 100: '#FBDDD9', 400: '#F58A80', 500: '#F2685C', 600: '#D84A3E' },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass-sm': '0 2px 12px -4px rgba(27, 74, 137, 0.14), 0 1px 3px -1px rgba(27, 74, 137, 0.08)',
        glass: '0 10px 34px -10px rgba(27, 74, 137, 0.20), 0 3px 10px -3px rgba(27, 74, 137, 0.10)',
        'glass-lg': '0 28px 70px -18px rgba(27, 74, 137, 0.26), 0 10px 26px -10px rgba(27, 74, 137, 0.14)',
        glow: '0 8px 28px -6px rgba(59, 138, 240, 0.45)',
        'glow-lg': '0 14px 44px -8px rgba(59, 138, 240, 0.50)',
        'inner-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.65)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // 페이지 배경: 옅은 azure 안개
        'azure-mist':
          'radial-gradient(1200px 600px at 12% -5%, rgba(94,168,251,0.16), transparent 55%), radial-gradient(1000px 560px at 105% 8%, rgba(63,174,224,0.14), transparent 52%), radial-gradient(900px 700px at 50% 115%, rgba(147,198,255,0.14), transparent 60%), linear-gradient(180deg, #F4F9FF 0%, #EDF4FC 45%, #E8F1FB 100%)',
        // 히어로/CTA용 오로라 메시
        'azure-aurora':
          'radial-gradient(800px 500px at 18% 22%, rgba(59,138,240,0.20), transparent 60%), radial-gradient(720px 520px at 82% 28%, rgba(63,174,224,0.18), transparent 60%), radial-gradient(700px 600px at 55% 90%, rgba(147,198,255,0.16), transparent 62%)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-26px) translateX(12px)' },
        },
        floatSlower: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(22px) translateX(-14px)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.9' },
          '50%': { transform: 'translate3d(2%, -2%, 0) scale(1.08)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientPan: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(59,138,240,0.35)' },
          '70%': { boxShadow: '0 0 0 12px rgba(59,138,240,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(59,138,240,0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22,1,0.36,1)',
        'float-slow': 'floatSlow 14s ease-in-out infinite',
        'float-slower': 'floatSlower 19s ease-in-out infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        'gradient-pan': 'gradientPan 8s ease infinite',
        'pulse-ring': 'pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};
