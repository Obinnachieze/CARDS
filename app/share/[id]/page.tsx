import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ShareEditorWrapper } from "@/components/editor/share-editor-wrapper";
import { CardPage, CardMode } from "@/components/editor/types";

// Define strict types for the DB response to avoid "any"
interface ProjectData {
    id: string;
    name: string;
    cards: CardPage[]; // Stored as JSONB, so it comes back as object/array
    card_mode: CardMode;
    user_id: string | null;
    is_public: boolean;
}

export default async function SharedProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch project - use regular client
    const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

    if (error || !project) {
        console.error("Shared project not found or not public:", error?.message);
        notFound();
    }

    const projectData = project as ProjectData;

    // Check if the viewer is the owner
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isOwner = user && user.id === projectData.user_id;

    // If owner, we pass the ID so they can edit directly (updates the DB)
    // If not owner, we pass null so it acts as "Save As" (Fork)
    const initialProjectId = isOwner ? projectData.id : null;

    return (
        <ShareEditorWrapper
            initialCards={projectData.cards}
            initialCardMode={projectData.card_mode}
            initialProjectId={initialProjectId}
        />
    );
}
