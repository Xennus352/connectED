"use client";
import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { CircleUserRound, House, Mail } from "lucide-react";

const DriverLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = usePathname();
  const buttonsRef = useRef<HTMLButtonElement[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { label: "Home", path: "/driver", icon: <House /> },
    { label: "Contact", path: "/driver/message", icon: <Mail /> },
    { label: "Profile", path: "/driver/profile", icon: <CircleUserRound /> },
  ];

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.path === pathName);
    if (
      activeIndex !== -1 &&
      indicatorRef.current &&
      buttonsRef.current[activeIndex]
    ) {
      const btn = buttonsRef.current[activeIndex];
      const { offsetLeft, offsetWidth } = btn;

      gsap.to(indicatorRef.current, {
        x: offsetLeft,
        width: offsetWidth,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [pathName]);
  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="h-full w-full">{children}</div>
      <div>
        <div className="dock dock-xl relative">
          {tabs.map((tab, i) => (
            <button
              key={tab.path}
              ref={(el) => {
                if (el) buttonsRef.current[i] = el;
              }}
              onClick={() => router.push(tab.path)}
              className="relative px-4 py-2"
            >
              <div>{tab.icon}</div>
              <span className="dock-label">{tab.label}</span>
            </button>
          ))}
          {/* Indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-1 bg-blue-500 rounded"
            style={{ width: 0, left: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverLayout;
