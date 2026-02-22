import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Menu items list for the prompt — kept server-side
const MENU_ITEMS = [
    { id: "app-1", name: "Crispy Spring Rolls", price: 8.99, category: "appetizers" },
    { id: "app-2", name: "Garlic Butter Shrimp", price: 12.99, category: "appetizers" },
    { id: "app-3", name: "Bruschetta Trio", price: 9.99, category: "appetizers" },
    { id: "main-1", name: "Grilled Ribeye Steak", price: 34.99, category: "main-courses" },
    { id: "main-2", name: "Pan-Seared Salmon", price: 28.99, category: "main-courses" },
    { id: "main-3", name: "Chicken Parmesan", price: 22.99, category: "main-courses" },
    { id: "main-4", name: "Mushroom Risotto", price: 19.99, category: "main-courses" },
    { id: "des-1", name: "Tiramisu", price: 9.99, category: "desserts" },
    { id: "des-2", name: "Chocolate Lava Cake", price: 11.99, category: "desserts" },
    { id: "des-3", name: "New York Cheesecake", price: 8.99, category: "desserts" },
    { id: "bev-1", name: "Fresh Lemonade", price: 4.99, category: "beverages" },
    { id: "bev-2", name: "Iced Coffee", price: 5.99, category: "beverages" },
    { id: "bev-3", name: "Tropical Smoothie", price: 6.99, category: "beverages" },
    { id: "spec-1", name: "Chef's Special Lobster", price: 49.99, category: "specials" },
    { id: "spec-2", name: "Wagyu Beef Sliders", price: 24.99, category: "specials" },
];

const SYSTEM_PROMPT = `You are a restaurant order parser. Given a customer's spoken order, extract the menu items and quantities they want to order.

Available menu items:
${MENU_ITEMS.map((item) => `- "${item.name}" (ID: ${item.id}, $${item.price})`).join("\n")}

Rules:
1. Match the customer's words to the closest menu item name, even if they don't say the exact name.
2. If no quantity is specified, default to 1.
3. If the customer's request doesn't match any menu item, return an empty array.
4. Be generous with matching — "steak" should match "Grilled Ribeye Steak", "lemonade" should match "Fresh Lemonade", etc.
5. Return ONLY valid JSON, no markdown, no explanation.

Return format (JSON array):
[{"id": "item-id", "name": "Item Name", "quantity": 1}]`;

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === "your_api_key_here") {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured. Please set it in .env.local" },
                { status: 500 }
            );
        }

        const { transcript } = await request.json();

        if (!transcript || typeof transcript !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid transcript" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: SYSTEM_PROMPT },
                        { text: `Customer said: "${transcript}"` },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 500,
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const text = response.text();

        // Parse the JSON response
        let parsedItems: { id: string; name: string; quantity: number }[];
        try {
            parsedItems = JSON.parse(text);
        } catch {
            // If Gemini returns invalid JSON, try to extract it
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                parsedItems = JSON.parse(jsonMatch[0]);
            } else {
                parsedItems = [];
            }
        }

        // Validate items against our menu
        const validItems = parsedItems
            .filter((item) => MENU_ITEMS.some((m) => m.id === item.id))
            .map((item) => ({
                id: item.id,
                name: item.name,
                quantity: Math.max(1, Math.min(item.quantity || 1, 99)),
            }));

        return NextResponse.json({ items: validItems });
    } catch (error) {
        console.error("Voice order API error:", error);
        return NextResponse.json(
            { error: "Failed to process voice order. Please try again." },
            { status: 500 }
        );
    }
}
