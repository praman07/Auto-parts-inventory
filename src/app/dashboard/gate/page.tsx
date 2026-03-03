"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, RotateCcw, ArrowRight, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import { toast } from "sonner";

export default function AdminGate() {
    const [pin, setPin] = useState("");
    const [shake, setShake] = useState(false);
    const router = useRouter();

    const CORRECT_PIN = "1234"; // In a real app, this should be an env var or DB check

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === CORRECT_PIN) {
                toast.success("Access Granted");
                localStorage.setItem("admin_authenticated", "true");
                router.push("/dashboard");
            } else {
                setShake(true);
                toast.error("Invalid PIN");
                setTimeout(() => {
                    setShake(false);
                    setPin("");
                }, 500);
            }
        }
    }, [pin, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 relative z-10"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-2xl">
                        <Shield className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Terminal</h1>
                    <p className="text-zinc-500 font-medium">Restricted Access • Enter Security PIN</p>
                </div>

                {/* PIN Display */}
                <motion.div
                    animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                    className="flex justify-center gap-4 mb-12"
                >
                    {[0, 1, 2, 3].map((idx) => (
                        <div
                            key={idx}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > idx
                                    ? "bg-primary scale-125 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                                    : "bg-zinc-800"
                                }`}
                        />
                    ))}
                </motion.div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-4">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white text-2xl font-bold transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => handleNumberClick("0")}
                        className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white text-2xl font-bold transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center"
                    >
                        0
                    </button>
                    <div className="h-16 flex items-center justify-center text-primary">
                        <Fingerprint className="w-8 h-8 opacity-50" />
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => router.push("/shop")}
                        className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                    >
                        Return to Shop <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
