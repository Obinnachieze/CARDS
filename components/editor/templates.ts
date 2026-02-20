import { EditorElement, CardFace } from "./types";
import { v4 as uuidv4 } from "uuid";

export interface Template {
    id: string;
    name: string;
    thumbnail: string; // Color or text for now
    cards: Array<{
        id: string;
        elements: EditorElement[];
        backgroundColor: string;
        currentFace: CardFace;
        celebration?: "none" | "confetti" | "fireworks" | "floating-emoji";
    }>;
}

export const templates: Template[] = [
    {
        id: "bday-simple",
        name: "Simple Birthday",
        thumbnail: "#FFD700",
        cards: [
            {
                id: uuidv4(),
                backgroundColor: "#ffffff",
                currentFace: "front",
                celebration: "confetti",
                elements: [
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 100,
                        y: 200,
                        content: "Happy Birthday!",
                        fontSize: 48,
                        fontFamily: "Pacifico",
                        color: "#FF4500",
                        width: 300,
                        height: 60,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    },
                    {
                        id: uuidv4(),
                        type: "shape",
                        content: "",
                        x: 150,
                        y: 300,
                        width: 100,
                        height: 100,
                        shapeType: "star",
                        color: "#FFD700",
                        face: "front",
                        rotation: 0
                    }
                ]
            }
        ]
    },
    {
        id: "thank-you-gradient",
        name: "Gradient Thank You",
        thumbnail: "linear-gradient(to right, #a8c0ff, #3f2b96)",
        cards: [
            {
                id: uuidv4(),
                backgroundColor: "#e0c3fc", // Fallback or base
                currentFace: "front",
                celebration: "confetti",
                elements: [
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 80,
                        y: 250,
                        content: "Thank You",
                        fontSize: 60,
                        fontFamily: "Great Vibes",
                        color: "#ffffff",
                        width: 340,
                        height: 80,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    }
                ]
            }
        ]
    },
    {
        id: "wedding-elegant",
        name: "Elegant Wedding",
        thumbnail: "linear-gradient(to bottom, #fdfbfb 0%, #ebedee 100%)",
        cards: [
            {
                id: uuidv4(),
                backgroundColor: "#ffffff",
                currentFace: "front",
                elements: [
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 50,
                        y: 150,
                        content: "Save the Date",
                        fontSize: 40,
                        fontFamily: "Playfair Display",
                        color: "#b8860b",
                        width: 400,
                        height: 50,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    },
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 50,
                        y: 250,
                        content: "Sarah & Mark",
                        fontSize: 56,
                        fontFamily: "Great Vibes",
                        color: "#333333",
                        width: 400,
                        height: 70,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    }
                ]
            }
        ]
    },
    {
        id: "christmas-festive",
        name: "Merry Christmas",
        thumbnail: "#c41e3a",
        cards: [
            {
                id: uuidv4(),
                backgroundColor: "#c41e3a",
                currentFace: "front",
                celebration: "fireworks",
                elements: [
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 50,
                        y: 200,
                        content: "Merry Christmas",
                        fontSize: 52,
                        fontFamily: "Mountains of Christmas",
                        color: "#ffffff",
                        width: 400,
                        height: 60,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    },
                    {
                        id: uuidv4(),
                        type: "shape",
                        content: "",
                        x: 200,
                        y: 300,
                        width: 100,
                        height: 100,
                        shapeType: "star",
                        color: "#ffd700",
                        face: "front",
                        rotation: 0
                    }
                ]
            }
        ]
    },
    {
        id: "baby-welcome",
        name: "Welcome Baby",
        thumbnail: "#a7dbd8",
        cards: [
            {
                id: uuidv4(),
                backgroundColor: "#f0f9ff",
                currentFace: "front",
                celebration: "floating-emoji",
                elements: [
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 50,
                        y: 180,
                        content: "Welcome Little One",
                        fontSize: 44,
                        fontFamily: "Caveat",
                        color: "#0ea5e9",
                        width: 400,
                        height: 50,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    },
                    {
                        id: uuidv4(),
                        type: "shape",
                        content: "",
                        x: 200,
                        y: 280,
                        width: 80,
                        height: 80,
                        shapeType: "heart",
                        color: "#38bdf8",
                        face: "front",
                        rotation: 0
                    }
                ]
            }
        ]
    },
    {
        id: "graduation-cap",
        name: "Graduation",
        thumbnail: "#1a1a1a",
        cards: [
            {
                id: uuidv4(),
                backgroundColor: "#111827",
                currentFace: "front",
                celebration: "confetti",
                elements: [
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 50,
                        y: 200,
                        content: "CONGRATS!",
                        fontSize: 64,
                        fontFamily: "Montserrat",
                        color: "#fbbf24",
                        fontWeight: "bold",
                        width: 400,
                        height: 80,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    },
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 50,
                        y: 300,
                        content: "Class of 2024",
                        fontSize: 32,
                        fontFamily: "Lato",
                        color: "#ffffff",
                        width: 400,
                        height: 40,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    }
                ]
            }
        ]
    },
    {
        id: "get-well-soon",
        name: "Get Well Soon",
        thumbnail: "#ff9a9e",
        cards: [
            {
                id: uuidv4(),
                backgroundColor: "#fff5f5",
                currentFace: "front",
                elements: [
                    {
                        id: uuidv4(),
                        type: "text",
                        x: 50,
                        y: 220,
                        content: "Get Well Soon",
                        fontSize: 52,
                        fontFamily: "Pacifico",
                        color: "#f87171",
                        width: 400,
                        height: 60,
                        face: "front",
                        textAlign: "center",
                        rotation: 0
                    }
                ]
            }
        ]
    }
];
