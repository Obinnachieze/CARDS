"use client";

import { useTransition } from "react";
import { createOrganization } from "./actions";
import { Building2, ArrowRight } from "lucide-react";

export function OnboardingForm() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await createOrganization(formData);
            if (result?.error) {
                alert(result.error);
            }
        });
    }

    return (
        <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                    <label htmlFor="companyName" className="text-sm font-medium text-zinc-300">
                        Company Name
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            required
                            disabled={isPending}
                            placeholder="e.g. Acme Corp"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {isPending ? "Setting up workspace..." : "Get started with your business"}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
