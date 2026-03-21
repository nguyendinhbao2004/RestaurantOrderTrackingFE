"use client";

import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-orange-50 dark:bg-orange-950/20" />

            {/* Floating orbs animation */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-orange-500/5" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8 animate-fadeIn">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                    <span className="text-sm font-medium text-orange-600">
                        Now Available — Version 2.0 is here
                    </span>
                </div>

                {/* Main heading */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-slideUp">
                    <span className="block">Build stunning apps</span>
                    <span className="block text-orange-600">
                        at lightning speed
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slideUp animation-delay-200">
                    The ultimate development platform for modern web applications.
                    Create, deploy, and scale with confidence using our cutting-edge tooling.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slideUp animation-delay-400">
                    <Button
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700 text-white border-0 text-lg px-8 h-12 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
                    >
                        Get Started Free
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="text-lg px-8 h-12 rounded-full hover:bg-accent transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Watch Demo
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-slideUp animation-delay-600">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-orange-600">50K+</div>
                        <div className="text-sm text-muted-foreground mt-1">Active Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-orange-600">99.9%</div>
                        <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-orange-600">150ms</div>
                        <div className="text-sm text-muted-foreground mt-1">Avg. Response</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-orange-600">4.9/5</div>
                        <div className="text-sm text-muted-foreground mt-1">User Rating</div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
                </div>
            </div>
        </section>
    );
}
