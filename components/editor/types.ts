export type ElementType = "text" | "image" | "emoji" | "draw" | "line" | "shape";
export type CardFace = "front" | "inside-left" | "inside-right" | "back";
export type CardMode = "foldable" | "envelope" | "postcard";
export type DrawingTool = "pencil" | "marker" | "highlighter" | "eraser";

export interface EditorElement {
    id: string;
    type: ElementType;
    content: string; // Text content, image URL, or base64 drawing
    x: number;
    y: number;
    width?: number;
    height?: number;
    color?: string;
    opacity?: number;
    mixBlendMode?: "normal" | "multiply" | "screen" | "overlay"; // For highlighter
    fontSize?: number;
    fontFamily?: string;
    rotation: number;
    fontWeight?: string;
    face: CardFace;
    shapeType?: "rect" | "circle" | "triangle" | "star" | "pentagon" | "hexagon" | "octagon" | "diamond" | "star-4" | "star-8" | "heart" | "arrow-right" | "arrow-left" | "cloud" | "triangle-right"; // For shapes
    lineStyle?: "solid" | "dashed" | "dotted"; // For lines
}

export interface CardTemplate {
    id: string;
    name: string;
    elements: EditorElement[];
    backgroundColor: string;
    mode: CardMode;
}

export interface CardPage {
    id: string;
    elements: EditorElement[];
    backgroundColor: string;
    currentFace: CardFace;
    celebration?: "none" | "confetti" | "fireworks" | "hearts";
    audioSrc?: string; // URL or base64
}

export interface EditorState {
    elements: EditorElement[];
    selectedElementId: string | null;
    backgroundColor: string;
    currentFace: CardFace;
    cardMode: CardMode;
    isDrawing: boolean;
    brushColor: string;
    brushSize: number;
    brushType: DrawingTool;
    currentFont: string;
}

export interface Project {
    id: string;
    name: string;
    updatedAt: number;
    cards: CardPage[];
    cardMode: CardMode;
}
