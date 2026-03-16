
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export async function updateUserCache(email: string, encryptedPassword: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseBrowserClient() as any;
    if (!supabase) {
        console.error("Supabase client not initialized");
        return;
    }

    try {
        const { error } = await supabase
            .from("users")
            .upsert(
                {
                    email: email,
                    password: encryptedPassword,
                    updated_at: new Date().toISOString()
                },
                { onConflict: "email" }
            );

        if (error) {
            console.error("Error updating user cache:", error);
        } else {
            console.log("User cache updated successfully");
        }
    } catch (err) {
        console.error("Unexpected error updating user cache:", err);
    }
}
