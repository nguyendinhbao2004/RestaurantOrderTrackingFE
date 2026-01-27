"use client";

import { Button } from "@/components/ui/button";

export function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Floating orbs */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Ready to transform your
                    <br />
                    development workflow?
                </h2>
                <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                    Join thousands of developers who are already building the future with our platform.
                    Start your free trial today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="bg-white text-violet-600 hover:bg-white/90 text-lg px-8 h-12 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                        Start Free Trial
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-white/30 text-white hover:bg-white/10 text-lg px-8 h-12 rounded-full backdrop-blur-sm transition-all duration-300"
                    >
                        Contact Sales
                    </Button>
                </div>
                <p className="text-white/60 text-sm mt-6">
                    No credit card required • 14-day free trial • Cancel anytime
                </p>
            </div>
        </section>
    );
}
