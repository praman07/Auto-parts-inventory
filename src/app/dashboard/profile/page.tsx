"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/animated-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/animated-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, MapPin, Package, LogOut, ShieldCheck, CreditCard, Bell } from "lucide-react";

type Address = {
    id: string;
    full_name: string;
    address_line1: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    is_default?: boolean;
};

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAddress, setNewAddress] = useState({
        full_name: "",
        address_line1: "",
        city: "",
        state: "",
        pincode: "",
        phone: ""
    });
    const [showAddAddr, setShowAddAddr] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }
            setUser(user);
            fetchAddresses(user.id);
        };
        getUser();
    }, []);

    const fetchAddresses = async (userId: string) => {
        const { data } = await supabase.from('addresses').select('*').eq('user_id', userId);
        if (data) setAddresses(data);
        setLoading(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        toast.success("Signed out successfully");
    };

    const handleAddAddress = async () => {
        if (!user) return;
        const { error } = await supabase.from('addresses').insert({
            user_id: user.id,
            ...newAddress,
            is_default: addresses.length === 0
        });

        if (error) {
            toast.error("Failed to add address");
        } else {
            toast.success("Address added");
            setShowAddAddr(false);
            fetchAddresses(user.id);
            setNewAddress({ full_name: "", address_line1: "", city: "", state: "", pincode: "", phone: "" });
        }
    };

    if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-600" /></div>;

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900">Your Account</h1>
                        <p className="text-zinc-500 text-sm font-medium">{user?.email}</p>
                    </div>
                    <Button variant="ghost" onClick={handleSignOut} className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold self-start md:self-center">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-3 space-y-1">
                        {[
                            { name: "Personal Info", icon: User, active: true },
                            { name: "Order History", icon: Package, link: "/dashboard/orders" },
                            { name: "Saved Addresses", icon: MapPin },
                            { name: "Payment Methods", icon: CreditCard },
                            { name: "Security", icon: ShieldCheck },
                            { name: "Notifications", icon: Bell },
                        ].map((item) => (
                            <button
                                key={item.name}
                                onClick={() => item.link && router.push(item.link)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${item.active
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/10'
                                    : 'text-zinc-500 hover:bg-white hover:text-zinc-900 border border-transparent hover:border-zinc-200'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-9 space-y-6">
                        {/* Profile Section */}
                        <Card className="rounded-xl border-zinc-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-zinc-50 border-b border-zinc-200">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-500">Personal Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                                        <Input defaultValue={user?.user_metadata?.full_name || "Bhogal Customer"} className="bg-zinc-50 border-zinc-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</Label>
                                        <Input value={user?.email} disabled className="bg-zinc-100 border-zinc-200 opacity-60" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mobile Number</Label>
                                        <Input value={user?.phone || user?.user_metadata?.phone} disabled className="bg-zinc-100 border-zinc-200 opacity-60" />
                                    </div>
                                </div>
                                <Button className="mt-6 bg-zinc-900 hover:bg-orange-600 font-bold h-10 px-6 rounded-lg">Update Profile</Button>
                            </CardContent>
                        </Card>

                        {/* Addresses Section */}
                        <Card className="rounded-xl border-zinc-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-zinc-50 border-b border-zinc-200 flex flex-row items-center justify-between py-3">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-500">Shipping Addresses</CardTitle>
                                <Button size="sm" variant="outline" onClick={() => setShowAddAddr(!showAddAddr)} className="h-8 text-[10px] font-black border-zinc-300">
                                    {showAddAddr ? "Cancel" : "Add New +"}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                {showAddAddr && (
                                    <div className="mb-8 p-6 bg-orange-50/50 border border-orange-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold">Contact Name</Label>
                                                <Input value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} className="bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold">Phone Number</Label>
                                                <Input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="bg-white" />
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <Label className="text-[10px] font-bold">Street Address</Label>
                                                <Input value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} className="bg-white" />
                                            </div>
                                            <div className="grid grid-cols-3 md:col-span-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold">City</Label>
                                                    <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-white" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold">State</Label>
                                                    <Input value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="bg-white" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold">ZIP Code</Label>
                                                    <Input value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={handleAddAddress} className="w-full bg-orange-600 hover:bg-orange-700 font-bold h-11 rounded-lg">Save New Address</Button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {addresses.map(addr => (
                                        <div key={addr.id} className="p-4 border border-zinc-200 rounded-xl bg-white hover:border-orange-300 transition-colors relative group">
                                            {addr.is_default && <span className="absolute top-4 right-4 text-[9px] font-black text-orange-600 border border-orange-200 px-2 py-0.5 rounded bg-orange-50 uppercase tracking-tight">Default</span>}
                                            <p className="font-bold text-sm text-zinc-900 mb-1">{addr.full_name}</p>
                                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                                {addr.address_line1}<br />
                                                {addr.city}, {addr.state} - {addr.pincode}<br />
                                                T: {addr.phone}
                                            </p>
                                            <div className="mt-4 flex gap-3 pt-2">
                                                <button className="text-[10px] font-bold text-zinc-400 hover:text-orange-600 uppercase tracking-wider">Edit</button>
                                                <button className="text-[10px] font-bold text-zinc-400 hover:text-red-500 uppercase tracking-wider">Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && !showAddAddr && (
                                        <div className="col-span-2 py-10 text-center border-2 border-dashed border-zinc-100 rounded-xl">
                                            <MapPin className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No addresses saved yet.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
