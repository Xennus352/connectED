"use client";
import React from "react";

const LoadingCard = () => {
  return (
    <>
      <svg
        width="180"
        height="180"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 100
       A40 40 0 1 1 80 20
       L70 35
       A25 25 0 1 0 50 85
       L40 100 Z"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeDasharray="600"
          strokeDashoffset="600"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="600"
            to="0"
            dur="2s"
            fill="freeze"
          />
        </path>

        <rect
          x="50"
          y="50"
          width="18"
          height="4"
          fill="none"
          stroke="#FFD166"
          strokeWidth="2"
          strokeDasharray="40"
          strokeDashoffset="40"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="40"
            to="0"
            dur="0.5s"
            begin="2s"
            fill="freeze"
          />
        </rect>

        <rect
          x="50"
          y="60"
          width="15"
          height="4"
          fill="none"
          stroke="#FFD166"
          strokeWidth="2"
          strokeDasharray="35"
          strokeDashoffset="35"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="35"
            to="0"
            dur="0.5s"
            begin="2.5s"
            fill="freeze"
          />
        </rect>

        <rect
          x="50"
          y="70"
          width="18"
          height="4"
          fill="none"
          stroke="#FFD166"
          strokeWidth="2"
          strokeDasharray="40"
          strokeDashoffset="40"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="40"
            to="0"
            dur="0.5s"
            begin="3s"
            fill="freeze"
          />
        </rect>

        <line
          x1="72"
          y1="42"
          x2="72"
          y2="75"
          stroke="#06D6A0"
          strokeWidth="2"
          strokeDasharray="40"
          strokeDashoffset="40"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="40"
            to="0"
            dur="1s"
            begin="3.5s"
            fill="freeze"
          />
        </line>

        <circle cx="72" cy="42" r="4" fill="#06D6A0" opacity="0">
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            dur="0.3s"
            begin="4.5s"
            fill="freeze"
          />
        </circle>
        <circle cx="72" cy="75" r="4" fill="#06D6A0" opacity="0">
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            dur="0.3s"
            begin="4.7s"
            fill="freeze"
          />
        </circle>

        <text
          x="60"
          y="115"
          fontFamily="Poppins, sans-serif"
          fontWeight="800"
          fontSize="18"
          fill="#ffffff"
          textAnchor="middle"
          letterSpacing="1"
          opacity="0"
        >
          ConnectED
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            dur="1s"
            begin="5s"
            fill="freeze"
          />
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
            <stop stopColor="#118AB2" />
            <stop offset="1" stopColor="#06D6A0" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};

export default LoadingCard;
