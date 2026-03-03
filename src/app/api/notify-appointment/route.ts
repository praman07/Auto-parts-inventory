import { NextResponse } from "next/server";

const ADMIN_PHONE = "918727061407";

const TIME_LABELS: Record<string, string> = {
    morning: "Morning (9AM-12PM)",
    afternoon: "Afternoon (1PM-4PM)",
    evening: "Evening (4PM-7PM)",
};

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { customerName, customerPhone, customerEmail, vehicleModel, problemType, preferredDate, preferredTime, notes } = body;

        // Build WhatsApp message
        const message = [
            `🔧 *New Service Appointment*`,
            ``,
            `👤 *Customer:* ${customerName}`,
            customerPhone ? `📞 *Phone:* ${customerPhone}` : "",
            `📧 *Email:* ${customerEmail}`,
            `🏍️ *Vehicle:* ${vehicleModel}`,
            `🛠️ *Problem:* ${problemType}`,
            `📅 *Date:* ${preferredDate}`,
            `⏰ *Time:* ${TIME_LABELS[preferredTime] || preferredTime}`,
            notes ? `📝 *Notes:* ${notes}` : "",
            ``,
            `— Bhogal Moto Spare System`,
        ].filter(Boolean).join("\n");

        const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;

        // Return the WhatsApp URL for silent background processing
        // The admin dashboard will show a notification badge
        return NextResponse.json({
            success: true,
            whatsappUrl: waUrl,
            message: "Appointment notification prepared",
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
