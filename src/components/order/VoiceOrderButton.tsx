"use client";

import { Button } from "@/components/ui/button";

interface VoiceOrderButtonProps {
    isListening: boolean;
    isSupported: boolean;
    onToggle: () => void;
}

export function VoiceOrderButton({
    isListening,
    isSupported,
    onToggle,
}: VoiceOrderButtonProps) {
    if (!isSupported) {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-2 opacity-50 cursor-not-allowed"
                title="Voice ordering is not supported in this browser. Please use Chrome or Edge."
            >
                <MicOffIcon />
                <span className="hidden sm:inline text-xs">Voice N/A</span>
            </Button>
        );
    }

    return (
        <div className="relative">
            {/* Pulse rings when listening */}
            {isListening && (
                <>
                    <span className="absolute inset-0 rounded-lg bg-violet-500/20 animate-ping" />
                    <span className="absolute inset-0 rounded-lg bg-violet-500/10 animate-pulse" />
                </>
            )}
            <Button
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={onToggle}
                className={`relative gap-2 transition-all duration-300 ${
                    isListening
                        ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/25"
                        : "hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                }`}
            >
                {isListening ? <MicActiveIcon /> : <MicIcon />}
                <span className="hidden sm:inline text-xs font-medium">
                    {isListening ? "Stop" : "Voice Order"}
                </span>
            </Button>
        </div>
    );
}

// ==================== ICONS ====================

function MicIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
    );
}

function MicActiveIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
        >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
    );
}

function MicOffIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="2" x2="22" y1="2" y2="22" />
            <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
            <path d="M5 10v2a7 7 0 0 0 12 5" />
            <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
            <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
    );
}
