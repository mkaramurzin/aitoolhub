/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    devIndicators: {
        appIsrStatus: false,
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src * data: mediastream: blob: filesystem: about: ws: wss: 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline'",
                            "script-src * data: blob: 'unsafe-inline' 'unsafe-eval'",
                            "script-src-elem * data: blob: 'unsafe-inline' 'unsafe-eval'",
                            "connect-src * data: blob: 'unsafe-inline'",
                            "img-src * data: blob: 'unsafe-inline'",
                            "media-src * data: blob: 'unsafe-inline'",
                            "frame-src * data: blob:",
                            "style-src * data: blob: 'unsafe-inline'",
                            "font-src * data: blob: 'unsafe-inline'",
                            "frame-ancestors * data: blob:"
                        ].join('; ')
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
            source: '/',
            destination: '/search', // Internally maps / to /search
            },
        ];
    },
};

export default config;
