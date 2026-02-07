export type ElementType = "text" | "image" | "emoji" | "draw";
export type CardFace = "front" | "inside-left" | "inside-right" | "back";
export type CardMode = "foldable" | "envelope";

export interface EditorElement {
    id: string;
    type: ElementType;
    content: string; // Text content, image URL, or base64 drawing
    x: number;
    y: number;
    width?: number;
    height?: number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    rotation: number;
    face: CardFace;
}

export interface CardTemplate {
    id: string;
    name: string;
    elements: EditorElement[];
    backgroundColor: string;
    mode: CardMode;
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
    currentFont: string;
}
