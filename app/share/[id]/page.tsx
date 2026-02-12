import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
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
    const supabase = await createClient(); // Await strictly required in newer Next.js/Supabase versions if using cookies, though createClient might be sync depending on implementation. Usually await is safer for server actions. Wait, lib/supabase/server says "export const createClient = () => ..." usually. Let's assume it returns a client.

    // Fetch project
    const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !project) {
        console.error("Project not found or error:", error);
        notFound();
    }

    const projectData = project as ProjectData;

    // Check visibility
    // If not public, check ownership
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isOwner = user && user.id === projectData.user_id;

    if (!projectData.is_public && !isOwner) {
        // If private and not owner, 404
        notFound();
    }

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
