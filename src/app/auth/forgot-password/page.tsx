"use client";

import { useState } from "react";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/animated-card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Key, ChevronLeft, ChevronRight, Check, History } from "lucide-react";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");

    const handleReset = async () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });
            if (error) throw error;
            setSent(true);
            toast.success("Reset link sent!");
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-orange-600 mb-8 transition-colors uppercase tracking-widest">
                    <ChevronLeft className="h-4 w-4" /> Back to Login
                </Link>

                <Card className="rounded-[3rem] border-2 border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden bg-white">
                    <CardHeader className="text-center pb-2 pt-10">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <History className="h-8 w-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-3xl font-black text-zinc-900 tracking-tight">Recover ID</CardTitle>
                        <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                            Email Recovery
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        {!sent ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-orange-600 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="your@email.com"
                                            className="h-14 pl-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-16 rounded-2xl bg-zinc-900 font-black text-xl shadow-xl shadow-zinc-900/10 mt-6 gap-2"
                                    onClick={handleReset}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <Check className="h-12 w-12 text-emerald-500 mx-auto" />
                                <p className="font-bold text-zinc-600">Check your inbox for the recovery link.</p>
                                <Button variant="outline" className="w-full" onClick={() => setSent(false)}>Resend Email</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
