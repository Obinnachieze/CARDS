"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function JoinPage() {
    const pathname = usePathname();
    const token = pathname.split("/").pop();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get("full_name"),
            email: formData.get("email"),
            role_title: formData.get("role_title"),
            department: formData.get("department"),
            birth_month: parseInt(formData.get("birth_month") as string, 10),
            birth_day: parseInt(formData.get("birth_day") as string, 10),
        };

        try {
            const res = await fetch(`/api/org/invites/${token}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to join");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-zinc-950">
                <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-zinc-900 border rounded-xl shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Success!</h1>
                    <p className="text-muted-foreground">You've successfully joined the organization.</p>
                    <p className="text-sm text-muted-foreground mt-4">Redirecting you to the home page...</p>
                </div>
            </div>
        );
    }

    const months = [
        { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
        { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
        { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
        { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
    ];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 border rounded-xl shadow-lg">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Join Your Team</h1>
                    <p className="text-muted-foreground text-sm">
                        Please provide your details so we can celebrate your birthday!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" name="full_name" placeholder="Jane Doe" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role_title">Job Title</Label>
                            <Input id="role_title" name="role_title" placeholder="Engineer" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" name="department" placeholder="Engineering" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Birthday</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Select name="birth_month" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                name="birth_day"
                                placeholder="Day (1-31)"
                                min="1"
                                max="31"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Join Organization
                    </Button>
                </form>
            </div>
        </div>
    );
}
