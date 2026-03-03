declare const _default: {
    darkMode: ["class", string];
    content: string[];
    theme: {
        extend: {
            fontSize: {
                "2xs": [string, {
                    lineHeight: string;
                }];
            };
            colors: {
                base: string;
                elevated: string;
                surface: string;
                card: string;
                "t-primary": string;
                "t-secondary": string;
                "t-muted": string;
                "t-inverse": string;
                gold: {
                    DEFAULT: string;
                    strong: string;
                    dim: string;
                    135: string;
                };
                success: string;
                danger: string;
                info: string;
                border: string;
                primary: string;
                secondary: string;
                background: string;
                text: string;
                muted: string;
                error: string;
            };
            backgroundImage: {
                shimmer: string;
                "gold-135": string;
                hero: string;
            };
            borderRadius: {
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
                "2xl": string;
                full: string;
            };
            boxShadow: {
                card: string;
                soft: string;
                glow: string;
                "glow-sm": string;
                gold: string;
            };
            keyframes: {
                shimmer: {
                    "0%": {
                        backgroundPosition: string;
                    };
                    "100%": {
                        backgroundPosition: string;
                    };
                };
                fadeInUp: {
                    from: {
                        opacity: string;
                        transform: string;
                    };
                    to: {
                        opacity: string;
                        transform: string;
                    };
                };
                fadeIn: {
                    from: {
                        opacity: string;
                    };
                    to: {
                        opacity: string;
                    };
                };
                scaleIn: {
                    from: {
                        opacity: string;
                        transform: string;
                    };
                    to: {
                        opacity: string;
                        transform: string;
                    };
                };
                slideUp: {
                    from: {
                        opacity: string;
                        transform: string;
                    };
                    to: {
                        opacity: string;
                        transform: string;
                    };
                };
                pulseGold: {
                    "0%, 100%": {
                        boxShadow: string;
                    };
                    "50%": {
                        boxShadow: string;
                    };
                };
            };
            animation: {
                shimmer: string;
                "fade-in-up": string;
                "fade-in": string;
                "scale-in": string;
                "slide-up": string;
                "pulse-gold": string;
            };
        };
    };
    plugins: any[];
};
export default _default;
