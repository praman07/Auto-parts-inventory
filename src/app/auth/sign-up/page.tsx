"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/animated-card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Phone, Key, ChevronLeft, ChevronRight, Check, Mail, MapPin, Eye, EyeOff } from "lucide-react";

function SignUpForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/shop';

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async () => {
        if (!formData.fullName || !formData.email || !formData.password) {
            toast.error("Please fill Name, Email and Security Password");
            return;
        }

        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'customer'
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Save to customer table
                const { error: custError } = await supabase.from('customers').insert({
                    user_id: authData.user.id,
                    full_name: formData.fullName,
                    phone: formData.phone,
                    city: formData.city,
                    pincode: formData.pincode
                });

                if (custError) console.error("Customer record error:", custError);

                // Save to addresses table
                const { error: addrError } = await supabase.from('addresses').insert({
                    user_id: authData.user.id,
                    full_name: formData.fullName,
                    address_line1: formData.addressLine1 || "Not Provided",
                    city: formData.city || "Ludhiana",
                    state: formData.state || "Punjab",
                    pincode: formData.pincode || "141001",
                    phone: formData.phone,
                    is_default: true
                });

                if (addrError) console.error("Address error:", addrError);
            }

            toast.success("Account created! Welcome aboard.");
            window.location.href = redirectTo;
        } catch (error: any) {
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 pt-10 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-orange-600 mb-8 transition-colors uppercase tracking-widest">
                    <ChevronLeft className="h-4 w-4" /> Exit to Homepage
                </Link>

                <Card className="rounded-[3rem] border-2 border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden bg-white">
                    <CardHeader className="text-center pb-2 pt-10">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="h-8 w-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-3xl font-black text-zinc-900 tracking-tight">Account</CardTitle>
                        <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                            Step {step} of 2
                        </CardDescription>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-zinc-100 rounded-full mt-6 overflow-hidden max-w-[100px] mx-auto">
                            <motion.div
                                className="h-full bg-orange-600"
                                animate={{ width: step === 1 ? "50%" : "100%" }}
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                                        <Input name="fullName" placeholder="Your Full Name" className="h-14 rounded-xl border-zinc-100 bg-zinc-50 font-bold" value={formData.fullName} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                            <Input name="email" type="email" placeholder="user@example.com" className="h-14 pl-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold" value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Security Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                            <Input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="h-14 pl-12 pr-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold"
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
                                    </div>
                                    <Button
                                        className="w-full h-16 rounded-2xl bg-zinc-900 font-black text-xl shadow-xl shadow-zinc-900/10 mt-6 gap-2"
                                        onClick={() => {
                                            if (!formData.fullName || !formData.email || !formData.password) {
                                                toast.error("Please fill Name, Email and Password");
                                                return;
                                            }
                                            setStep(2);
                                        }}
                                    >
                                        Next: Contact Details <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                            <Input name="phone" placeholder="Your mobile number" className="h-14 pl-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold" value={formData.phone} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                            <Input name="city" placeholder="Your city" className="h-14 pl-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold" value={formData.city} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Pincode</label>
                                        <Input name="pincode" placeholder="Pincode" className="h-14 rounded-xl border-zinc-100 bg-zinc-50 font-bold" value={formData.pincode} onChange={handleChange} />
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <Button variant="outline" className="h-16 flex-1 rounded-2xl border-2 font-black" onClick={() => setStep(1)}>Back</Button>
                                        <Button
                                            className="h-16 flex-[2] rounded-2xl bg-orange-600 hover:bg-orange-700 font-black text-xl shadow-xl shadow-orange-600/20 gap-2"
                                            onClick={handleSignUp}
                                            disabled={loading}
                                        >
                                            {loading ? "Creating..." : <><Check className="h-6 w-6" /> Finish Setup</>}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    <CardFooter className="justify-center border-t border-zinc-100 p-8 pt-6">
                        <p className="text-sm font-bold text-zinc-500">
                            Already registered?{" "}
                            <Link
                                href={`/auth/login${redirectTo !== '/shop' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                                className="text-orange-600 hover:underline"
                            >
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">Loading...</div>}>
            <SignUpForm />
        </Suspense>
    );
}
