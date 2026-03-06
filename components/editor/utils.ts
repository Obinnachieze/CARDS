import { CardMode, CardOrientation } from "./types";

export const getCardDimensions = (mode: CardMode, orientation: CardOrientation) => {
    let baseW = 320;
    let baseH = 480;

    switch (mode) {
        case "foldable":
            baseW = 320;
            baseH = 448; // 5x7 roughly
            break;
        case "postcard":
            baseW = 320;
            baseH = 213; // 6x4 roughly
            break;
        case "envelope":
            baseW = 320;
            baseH = 224; // Standard envelope
            break;
        default:
            baseW = 360;
            baseH = 504;
    }

    // Swap if orientation is landscape
    // Note: Envelope is usually landscape by default, so we might want to handle it specifically
    if (orientation === "landscape" && mode !== "envelope") {
        return { width: baseH, height: baseW };
    }
    return { width: baseW, height: baseH };
};
