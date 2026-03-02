import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "No userId provided" }, { status: 400 });
    }

    try {
        const supabaseAdmin = await createAdminClient();
        const { data, error } = await supabaseAdmin.from("organizations").select("*").eq("owner_id", userId).single();

        return NextResponse.json({
            success: true,
            data,
            error,
            envVars: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
