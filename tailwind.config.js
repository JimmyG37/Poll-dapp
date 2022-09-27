module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            animation: {
                flip: "flip 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                bounce: "bounce 2.6s infinite ease-in-out",
                scaling: "scaling 2.6s infinite ease-in-out",
                flash: "flash 7s infinite",
                shine: "shine 5s infinite",
                spinning: "spinning 1s linear infinite",
            },
            keyframes: {
                flip: {
                    from: { transform: "rotateX(0deg)", transformOrigin: "50% bottom " },
                    to: { transform: "rotateX(180deg)", transformOrigin: "50% bottom " },
                },
                bounce: {
                    "10%": {
                        transition: "easeout",
                        transform: "translateY(-6px)",
                    },
                    "30%": {
                        transition: "easeout",
                        transform: "translateY(-8px)",
                    },
                },
                scaling: {
                    "20%": {
                        transform: "scale(0.6)",
                    },
                    "50%": {
                        transform: "scale(0.5)",
                    },
                },
                flash: {
                    "0%": {
                        transform: "rotate(0deg) scale(0)",
                    },
                    "8%": {
                        transform: "rotate(0deg) scale(0)",
                    },
                    "10%": {
                        transform: "rotate(150deg) scale(1.8)",
                    },
                    "15%": {
                        transform: "rotate(45deg) scale(0)",
                    },
                    "100%": {
                        transform: "rotate(45deg) scale(0)",
                    },
                },
                shine: {
                    "20%": {
                        transform: "rotate(25deg) translateY(20px)",
                    },

                    "100%": {
                        transform: "rotate(25deg) translateY(10px)",
                    },
                },
                spinning: {
                    "0%": {},
                    "100%": {
                        transform: "rotateY(180deg)",
                    },
                    "50%": {
                        transform: "rotateY(0deg)",
                    },
                },
            },
        },
        fontFamily: {
            redhat: ["Red Hat Text", "sans-serif"],
        },
        plugins: [require("tailwind-scrollbar-hide"), require("tailwind-scrollbar")],
    },
}
