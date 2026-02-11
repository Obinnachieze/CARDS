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
    }
];
