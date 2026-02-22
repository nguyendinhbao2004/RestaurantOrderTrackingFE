"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/mock-data";
import { MatchedItem } from "@/hooks/useVoiceOrder";

interface VoiceOrderFeedbackProps {
    isListening: boolean;
    isProcessing: boolean;
    transcript: string;
    interimTranscript: string;
    matchedItems: MatchedItem[];
    error: string | null;
    onStop: () => void;
    onClear: () => void;
}

export function VoiceOrderFeedback({
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    matchedItems,
    error,
    onStop,
    onClear,
}: VoiceOrderFeedbackProps) {
    const hasContent =
        isListening || isProcessing || transcript || matchedItems.length > 0 || error;

    if (!hasContent) return null;

    return (
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 backdrop-blur-sm shadow-lg shadow-violet-500/5 overflow-hidden">
            {/* Listening indicator bar */}
            {isListening && (
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
            )}

            <CardContent className="p-4 space-y-3">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isListening ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-3 bg-violet-500 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" />
                                    <span className="w-1.5 h-4 bg-violet-600 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_0.1s]" />
                                    <span className="w-1.5 h-2.5 bg-violet-500 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_0.2s]" />
                                    <span className="w-1.5 h-5 bg-violet-600 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_0.3s]" />
                                    <span className="w-1.5 h-3 bg-violet-500 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_0.15s]" />
                                </div>
                                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                                    Listening...
                                </span>
                            </>
                        ) : (
                            <span className="text-sm font-medium text-muted-foreground">
                                Voice Order Result
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {isListening && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onStop}
                                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                Stop
                            </Button>
                        )}
                        {!isListening && (transcript || matchedItems.length > 0) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="h-7 text-xs"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-700 dark:text-red-300 text-sm">
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
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Transcript */}
                {(transcript || interimTranscript) && (
                    <div className="p-3 bg-white/60 dark:bg-white/5 rounded-lg border border-violet-200/50 dark:border-violet-800/30">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">
                            You said:
                        </p>
                        <p className="text-sm">
                            {transcript && (
                                <span className="text-foreground">{transcript}</span>
                            )}
                            {interimTranscript && (
                                <span className="text-muted-foreground/60 italic">
                                    {transcript ? " " : ""}
                                    {interimTranscript}
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {/* Processing indicator */}
                {isProcessing && (
                    <div className="flex items-center gap-2 p-2 bg-violet-50 dark:bg-violet-950/20 rounded-lg text-violet-700 dark:text-violet-300 text-sm">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        AI is processing your order...
                    </div>
                )}

                {/* Matched Items */}
                {matchedItems.length > 0 && (
                    <>
                        <Separator className="bg-violet-200/50 dark:bg-violet-800/30" />
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-emerald-500"
                                >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Added to cart:
                            </p>
                            {matchedItems.map((item, index) => (
                                <div
                                    key={`${item.menuItem.id}-${index}`}
                                    className="flex items-center justify-between p-2 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 animate-in slide-in-from-left-2 duration-300"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs"
                                        >
                                            ×{item.quantity}
                                        </Badge>
                                        <span className="text-sm font-medium">
                                            {item.menuItem.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                                        {formatCurrency(
                                            item.menuItem.price * item.quantity
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* No matches hint */}
                {!isListening &&
                    !isProcessing &&
                    transcript &&
                    matchedItems.length === 0 &&
                    !error && (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-700 dark:text-amber-300 text-sm text-center">
                            No menu items matched. Try saying specific dish names
                            like &quot;Ribeye Steak&quot; or &quot;Lemonade&quot;.
                        </div>
                    )}
            </CardContent>
        </Card>
    );
}
