"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MenuItem } from "@/types";
import { menuItems } from "@/lib/mock-data";
import { useOrder } from "@/contexts/OrderContext";

// ==================== TYPES ====================

export interface MatchedItem {
    menuItem: MenuItem;
    quantity: number;
    addedToCart: boolean;
}

interface UseVoiceOrderReturn {
    isListening: boolean;
    isSupported: boolean;
    isProcessing: boolean;
    transcript: string;
    interimTranscript: string;
    matchedItems: MatchedItem[];
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
    clearResults: () => void;
}

// ==================== LOCAL FALLBACK MATCHING ====================

const NUMBER_WORDS: Record<string, number> = {
    one: 1, a: 1, an: 1,
    two: 2, couple: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
};

function parseQuantity(text: string): number {
    const digitMatch = text.match(/\d+/);
    if (digitMatch) return parseInt(digitMatch[0], 10);
    const lower = text.toLowerCase();
    for (const [word, num] of Object.entries(NUMBER_WORDS)) {
        if (lower.includes(word)) return num;
    }
    return 1;
}

function normalizeString(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function localFuzzyMatch(transcript: string): MatchedItem[] {
    const normalized = normalizeString(transcript);
    const matched: MatchedItem[] = [];
    const alreadyMatched = new Set<string>();
    const segments = normalized.split(/\b(?:and|also|plus|with)\b/);

    for (const segment of segments) {
        const trimmed = segment.trim();
        if (!trimmed) continue;
        let bestMatch: MenuItem | null = null;
        let bestScore = 0;

        for (const item of menuItems) {
            if (!item.isAvailable || alreadyMatched.has(item.id)) continue;
            const itemNorm = normalizeString(item.name);
            const segWords = trimmed.split(" ");
            const itemWords = itemNorm.split(" ");

            // Contains match
            if (trimmed.includes(itemNorm) || itemNorm.includes(trimmed)) {
                if (0.9 > bestScore) { bestScore = 0.9; bestMatch = item; }
                continue;
            }

            // Keyword match
            const keywordScore = itemWords.filter((kw) =>
                segWords.some((sw) => sw.includes(kw) || kw.includes(sw) || levenshteinDistance(kw, sw) <= 2)
            ).length / itemWords.length;

            if (keywordScore * 0.85 > bestScore && keywordScore * 0.85 >= 0.45) {
                bestScore = keywordScore * 0.85;
                bestMatch = item;
            }
        }

        if (bestMatch) {
            alreadyMatched.add(bestMatch.id);
            matched.push({ menuItem: bestMatch, quantity: parseQuantity(trimmed), addedToCart: false });
        }
    }

    return matched;
}

// ==================== GEMINI API CALL ====================

async function callGeminiAPI(transcript: string): Promise<MatchedItem[]> {
    const response = await fetch("/api/voice-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "API request failed");
    }

    const data = await response.json();
    const items: MatchedItem[] = [];

    if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
            const menuItem = menuItems.find((m) => m.id === item.id);
            if (menuItem) {
                items.push({
                    menuItem,
                    quantity: item.quantity || 1,
                    addedToCart: false,
                });
            }
        }
    }

    return items;
}

// ==================== HOOK ====================

export function useVoiceOrder(): UseVoiceOrderReturn {
    const { addToCart } = useOrder();
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [matchedItems, setMatchedItems] = useState<MatchedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const processedTranscriptsRef = useRef<Set<string>>(new Set());

    const isSupported =
        typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
        };
    }, []);

    const processTranscript = useCallback(
        async (finalTranscript: string) => {
            if (!finalTranscript.trim()) return;
            if (processedTranscriptsRef.current.has(finalTranscript)) return;
            processedTranscriptsRef.current.add(finalTranscript);

            setIsProcessing(true);
            let items: MatchedItem[] = [];

            try {
                // Try Gemini AI first
                items = await callGeminiAPI(finalTranscript);
            } catch (apiError) {
                console.warn("Gemini API failed, falling back to local matching:", apiError);
                // Fallback to local fuzzy matching
                items = localFuzzyMatch(finalTranscript);
            }

            if (items.length > 0) {
                const addedItems = items.map((item) => {
                    addToCart(item.menuItem, item.quantity);
                    return { ...item, addedToCart: true };
                });
                setMatchedItems((prev) => [...prev, ...addedItems]);
            }

            setIsProcessing(false);
        },
        [addToCart]
    );

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        setError(null);
        setTranscript("");
        setInterimTranscript("");
        setMatchedItems([]);
        setIsProcessing(false);
        processedTranscriptsRef.current.clear();

        const SpeechRecognitionAPI =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalText = "";
            let interimText = "";

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript + " ";
                } else {
                    interimText += result[0].transcript;
                }
            }

            if (finalText.trim()) {
                setTranscript((prev) => (prev + " " + finalText).trim());
                processTranscript(finalText.trim());
            }

            setInterimTranscript(interimText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === "not-allowed") {
                setError("Microphone access denied. Please allow microphone access in your browser settings.");
            } else if (event.error !== "no-speech" && event.error !== "aborted") {
                setError(`Voice recognition error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript("");
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSupported, processTranscript]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setInterimTranscript("");
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) stopListening();
        else startListening();
    }, [isListening, startListening, stopListening]);

    const clearResults = useCallback(() => {
        setTranscript("");
        setInterimTranscript("");
        setMatchedItems([]);
        setError(null);
        setIsProcessing(false);
        processedTranscriptsRef.current.clear();
    }, []);

    return {
        isListening,
        isSupported,
        isProcessing,
        transcript,
        interimTranscript,
        matchedItems,
        error,
        startListening,
        stopListening,
        toggleListening,
        clearResults,
    };
}
