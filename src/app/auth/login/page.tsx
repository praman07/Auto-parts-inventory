"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/animated-card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogIn, Key, Mail, ChevronLeft, Eye, EyeOff } from "lucide-react";

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/shop';

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            toast.success("Welcome back!");
            window.location.href = redirectTo;
        } catch (error: any) {
            toast.error(error.message || "Failed to login");
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
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-orange-600 mb-8 transition-colors uppercase tracking-widest">
                    <ChevronLeft className="h-4 w-4" /> Exit to Homepage
                </Link>

                <Card className="rounded-[3rem] border-2 border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden bg-white">
                    <CardHeader className="text-center pb-2 pt-10">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <LogIn className="h-8 w-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-3xl font-black text-zinc-900 tracking-tight">Workshop Login</CardTitle>
                        <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                            Access your service history
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-orange-600 transition-colors" />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        className="h-14 pl-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold focus-visible:ring-0 focus-visible:border-orange-600"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Security Password</label>
                                </div>
                                <div className="relative group">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-orange-600 transition-colors" />
                                    <Input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-14 pl-12 pr-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold focus-visible:ring-0 focus-visible:border-orange-600"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <Link href="/auth/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-orange-600">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                className="w-full h-16 rounded-2xl bg-zinc-900 hover:bg-orange-600 font-black text-xl shadow-xl shadow-zinc-900/10 mt-4 transition-all active:scale-95"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Sign In Now"}
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-zinc-100 p-8 pt-6">
                        <p className="text-sm font-bold text-zinc-500">
                            No account? <Link href="/auth/sign-up" className="text-orange-600 hover:underline">Create Workshop ID</Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">Loading Workshop Auth...</div>}>
            <LoginForm />
        </Suspense>
    );
}
