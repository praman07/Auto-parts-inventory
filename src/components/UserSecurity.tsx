"use client";

import { useEffect } from "react";

export function UserSecurity({ children }: { children?: React.ReactNode }) {
    useEffect(() => {
        const disableContextMenu = (e: MouseEvent) => {
            // Allow inputs to have context menu if needed, but the user requested strictly "too much secure"
            e.preventDefault();
        };

        const disableKeys = (e: KeyboardEvent) => {
            // F12
            if (e.key === "F12") {
                e.preventDefault();
            }
            // Ctrl+Shift+I / J / C
            if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "i" || e.key === "j" || e.key === "c")) {
                e.preventDefault();
            }
            // Ctrl+U
            if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
                e.preventDefault();
            }
        };

        const disableDrag = (e: DragEvent) => {
            e.preventDefault();
        };

        document.addEventListener("contextmenu", disableContextMenu);
        document.addEventListener("keydown", disableKeys);
        document.addEventListener("dragstart", disableDrag);

        return () => {
            document.removeEventListener("contextmenu", disableContextMenu);
            document.removeEventListener("keydown", disableKeys);
            document.removeEventListener("dragstart", disableDrag);
        };
    }, []);

    return (
        <div className="select-none [&_*]:[-webkit-user-drag:none] [&_img]:pointer-events-none">
            {children}
        </div>
    );
}
