import { createClient, createAdminClient } from "@/lib/supabase/server";
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

    // Use admin client to bypass RLS — this page does its own access control below
    const adminSupabase = await createAdminClient();

    // Fetch project using admin client (bypasses RLS so anonymous users can view shared cards)
    const { data: project, error } = await adminSupabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !project) {
        console.error("Project not found or error:", error);
        notFound();
    }

    const projectData = project as ProjectData;

    // Check visibility — use normal client for auth
    const supabase = await createClient();
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
