"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem("admin_auth", "true");
                toast.success("Authentication successful");
                router.push("/dashboard");
            } else {
                toast.error(data.error || "Incorrect password");
                setPassword("");
            }
        } catch (error) {
            toast.error("Authentication failed. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-950 rounded-2xl mx-auto flex items-center justify-center border border-white/5 mb-6 shadow-xl">
                        <Shield className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight mb-2">Restricted Area</h1>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Admin Authorization Required</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2 relative">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Master Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your key..."
                                className="h-16 pl-12 pr-6 rounded-2xl bg-zinc-950 border-white/5 text-white font-bold placeholder:text-zinc-600 focus:border-orange-500/50 transition-all font-mono tracking-widest text-lg"
                                autoFocus
                            />
                        </div>
                    </div>

                    <Button
                        disabled={loading || !password}
                        className="w-full h-16 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-lg gap-3 transition-all active:scale-95 shadow-xl shadow-orange-600/20"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authenticate"}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
