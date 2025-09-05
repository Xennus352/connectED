"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<SVGTextElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !bgRef.current) return;

    const paths: (
      | SVGPathElement
      | SVGLineElement
      | SVGRectElement
      | SVGCircleElement
    )[] = Array.from(
      svgRef.current.querySelectorAll("path, line, rect, circle")
    );

    // Select all tspans inside the text element
    const tspans = Array.from(svgRef.current.querySelectorAll("text tspan"));

    // Prepare paths for drawing effect
    paths.forEach((path) => {
      const length =
        "getTotalLength" in path
          ? path.getTotalLength()
          : "getBBox" in path
          ? (path as SVGGraphicsElement).getBBox().width +
            (path as SVGGraphicsElement).getBBox().height
          : 0;
      path.style.strokeDasharray = length.toString();
      path.style.strokeDashoffset = length.toString();
      path.style.stroke = path.style.stroke || "#fff"; // white strokes for contrast
      path.style.fill = path.style.fill || "none";
    });

    // Initially hide tspans for letter animation
    tspans.forEach((tspan) => {
      const tspanEl = tspan as SVGElement;
      tspanEl.style.opacity = "0";
      tspanEl.style.transform = "translateY(5px)";
      tspanEl.style.transformOrigin = "center";
    });

    const tl = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      onComplete: () => {
        setTimeout(onFinish, 1200);
      },
    });

    // Animate gradient background colors infinitely
    gsap.to(bgRef.current, {
      backgroundPosition: "200% 0%",
      duration: 8,
      ease: "linear",
      repeat: -1,
      yoyo: true,
    });

    // Draw SVG paths
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 2.5,
      stagger: 0.25,
    })

      // Animate text letters (tspan) fade-in + move up staggered
      .to(
        tspans,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.15,
          ease: "power2.out",
          clearProps: "all", // remove inline styles after animation
        },
        ">-0.8" // start letters slightly before paths end
      )

      // Fade out everything
      .to(
        svgRef.current,
        {
          opacity: 0,
          duration: 1,
          delay: 1,
          pointerEvents: "none",
        },
        ">+0.5"
      )
      .to(
        bgRef.current,
        {
          opacity: 0,
          duration: 1,
          pointerEvents: "none",
        },
        "<"
      );

    return () => {
      tl.kill();
      gsap.killTweensOf(bgRef.current);
    };
  }, [onFinish]);

  return (
    <div
      ref={bgRef}
      style={{
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(270deg, #118AB2, #06D6A0, #FFD166, #EF476F)",
        backgroundSize: "600% 600%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <svg
        ref={svgRef}
        width="220"
        height="200"
        viewBox="0 0 220 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 100 A40 40 0 1 1 80 20 L70 35 A25 25 0 1 0 50 85 L40 100 Z"
          stroke="#fff"
          strokeWidth="3"
          strokeLinejoin="round"
          fill="url(#grad1)"
        />
        <rect x="50" y="50" width="18" height="4" fill="#fff" rx="1" />
        <rect x="50" y="60" width="15" height="4" fill="#fff" rx="1" />
        <rect x="50" y="70" width="18" height="4" fill="#fff" rx="1" />
        <circle
          cx="72"
          cy="42"
          r="4"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="72"
          cy="75"
          r="4"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
        />
        <line
          x1="72"
          y1="42"
          x2="72"
          y2="75"
          stroke="#fff"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <text
          x="1"
          y="115"
          fontFamily="Poppins, sans-serif"
          fontWeight="800"
          fontSize="18"
          fill="#fff"
          textAnchor="start"
        >
          <tspan fontWeight="bold">C</tspan>
          <tspan dx="5">o</tspan>
          <tspan dx="5">n</tspan>
          <tspan dx="5">n</tspan>
          <tspan dx="5">e</tspan>
          <tspan dx="5">c</tspan>
          <tspan dx="5">t</tspan>
          <tspan dx="7" fontWeight="bold">
            E
          </tspan>
          <tspan dx="7" fontWeight="bold">
            D
          </tspan>
        </text>

        <defs>
          <linearGradient
            id="grad1"
            x1="20"
            y1="20"
            x2="100"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default SplashScreen;
