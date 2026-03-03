"use client";

import { useEffect } from "react";

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // 1. Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 2. Disable Keyboard Shortcuts for DevTools
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F12") e.preventDefault();
            if (e.ctrlKey && e.shiftKey && ["I", "J", "C", "i", "j", "c"].includes(e.key)) e.preventDefault();
            if (e.ctrlKey && (e.key === "u" || e.key === "U")) e.preventDefault();
            if (e.ctrlKey && (e.key === "s" || e.key === "S")) e.preventDefault();
        };

        // 3. Disable drag (prevents image saving via drag)
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
        };

        // 4. Detect window resize (often happens when DevTools is opened)
        const handleResize = () => {
            const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
            const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
            if (widthDiff > 200 || heightDiff > 200) {
                console.clear();
            }
        };

        // 5. Console Warning Flood
        const consoleInterval = setInterval(() => {
            console.clear();
            // eslint-disable-next-line no-console
            console.log("%cStop!", "color: red; font-family: sans-serif; font-size: 44px; font-weight: black; -webkit-text-stroke: 1px black;");
            // eslint-disable-next-line no-console
            console.log("%cThis is a protected area. Unauthorized access is prohibited.", "font-size: 16px; font-weight: bold; color: #666;");
        }, 2000);

        // 6. Periodic Debugger Trap
        const debuggerInterval = setInterval(() => {
            (function () {
                const start = new Date().getTime();
                // eslint-disable-next-line no-debugger
                debugger;
                const end = new Date().getTime();
                if (end - start > 100) {
                    window.location.reload();
                }
            })();
        }, 4000);

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("dragstart", handleDragStart);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("dragstart", handleDragStart);
            window.removeEventListener("resize", handleResize);
            clearInterval(consoleInterval);
            clearInterval(debuggerInterval);
        };
    }, []);

    return (
        <div className="select-none [&_img]:pointer-events-none">
            {children}
        </div>
    );
}
