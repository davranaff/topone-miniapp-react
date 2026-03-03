var rgb = function (v) { return "rgb(var(".concat(v, ") / <alpha-value>)"); };
export default {
    darkMode: ["class", '[data-theme="dark"]'],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            /* ---- Font sizes ---- */
            fontSize: {
                "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
            },
            /* ---- Colors ---- */
            colors: {
                /* ── Backgrounds ── */
                base: rgb("--bg-base"),
                elevated: rgb("--bg-elevated"),
                surface: rgb("--bg-surface"),
                card: rgb("--bg-card"),
                /* ── Text ── */
                "t-primary": rgb("--text-primary"),
                "t-secondary": rgb("--text-secondary"),
                "t-muted": rgb("--text-muted"),
                "t-inverse": rgb("--text-inverse"),
                /* ── Gold ── */
                gold: {
                    DEFAULT: rgb("--accent-gold"),
                    strong: rgb("--accent-gold-strong"),
                    dim: rgb("--accent-gold-dim"),
                    135: "oklch(62% 0.18 85)", /* gradient stop */
                },
                /* ── Semantic ── */
                success: rgb("--accent-green"),
                danger: rgb("--accent-red"),
                info: rgb("--accent-blue"),
                /* ── Borders ── */
                border: rgb("--border-default"),
                /* ── Legacy aliases (keep existing components working) ── */
                primary: rgb("--color-primary"),
                secondary: rgb("--color-secondary"),
                background: rgb("--color-background"),
                text: rgb("--color-text"),
                muted: rgb("--color-muted"),
                error: rgb("--color-error"),
            },
            /* ---- Background images ---- */
            backgroundImage: {
                shimmer: "linear-gradient(90deg, rgb(var(--bg-surface)) 25%, rgb(var(--bg-elevated)) 50%, rgb(var(--bg-surface)) 75%)",
                "gold-135": "linear-gradient(135deg, rgb(var(--accent-gold-strong)), rgb(var(--accent-gold)))",
                hero: "radial-gradient(circle at top, rgba(212,160,23,0.2), transparent 55%)",
            },
            /* ---- Border radius ---- */
            borderRadius: {
                xs: "var(--radius-xs)",
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                xl: "var(--radius-xl)",
                "2xl": "var(--radius-2xl)",
                full: "var(--radius-full)",
            },
            /* ---- Box shadows ---- */
            boxShadow: {
                card: "var(--shadow-card)",
                soft: "var(--shadow-soft)",
                glow: "var(--shadow-glow)",
                "glow-sm": "0 0 16px rgba(212,160,23,0.2)",
                gold: "var(--shadow-gold)",
            },
            /* ---- Keyframes ---- */
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-200% center" },
                    "100%": { backgroundPosition: "200% center" },
                },
                fadeInUp: {
                    from: { opacity: "0", transform: "translateY(12px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                scaleIn: {
                    from: { opacity: "0", transform: "scale(0.95)" },
                    to: { opacity: "1", transform: "scale(1)" },
                },
                slideUp: {
                    from: { opacity: "0", transform: "translateY(100%)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                pulseGold: {
                    "0%, 100%": { boxShadow: "0 0 8px rgba(212,160,23,0.3)" },
                    "50%": { boxShadow: "0 0 20px rgba(212,160,23,0.6)" },
                },
            },
            /* ---- Animations ---- */
            animation: {
                shimmer: "shimmer 1.6s ease-in-out infinite",
                "fade-in-up": "fadeInUp 0.35s ease both",
                "fade-in": "fadeIn 0.25s ease both",
                "scale-in": "scaleIn 0.25s ease both",
                "slide-up": "slideUp 0.4s cubic-bezier(0.32,0.72,0,1) both",
                "pulse-gold": "pulseGold 2s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
