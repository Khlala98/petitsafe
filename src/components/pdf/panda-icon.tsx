import { Svg, Circle, Ellipse, Path, G } from "@react-pdf/renderer";

export function PandaIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={(size * 230) / 280} viewBox="60 50 280 230">
      <Circle cx="200" cy="170" r="130" fill="#2563eb" opacity={0.15} />
      <Circle cx="200" cy="170" r="110" fill="#2563eb" opacity={0.25} />

      <Ellipse cx="138" cy="90" rx="32" ry="30" fill="#1a1a1a" />
      <Ellipse cx="262" cy="90" rx="32" ry="30" fill="#1a1a1a" />

      <Ellipse cx="138" cy="93" rx="18" ry="16" fill="#FFB6C1" />
      <Ellipse cx="262" cy="93" rx="18" ry="16" fill="#FFB6C1" />

      <Ellipse cx="200" cy="175" rx="85" ry="80" fill="#ffffff" stroke="#e0e0e0" strokeWidth={1} />

      <Ellipse cx="165" cy="155" rx="30" ry="28" fill="#1a1a1a" />
      <Ellipse cx="235" cy="155" rx="30" ry="28" fill="#1a1a1a" />

      <Ellipse cx="170" cy="153" rx="14" ry="16" fill="#ffffff" />
      <Ellipse cx="230" cy="153" rx="14" ry="16" fill="#ffffff" />

      <Circle cx="174" cy="151" r="8" fill="#1a1a1a" />
      <Circle cx="234" cy="151" r="8" fill="#1a1a1a" />

      <Circle cx="177" cy="148" r="3" fill="#ffffff" />
      <Circle cx="237" cy="148" r="3" fill="#ffffff" />

      <Ellipse cx="200" cy="185" rx="12" ry="8" fill="#1a1a1a" />

      <Path d="M192 193 Q200 203 208 193" fill="none" stroke="#1a1a1a" strokeWidth={2} strokeLinecap="round" />

      <Circle cx="160" cy="190" r="16" fill="#FFB6C1" opacity={0.5} />
      <Circle cx="240" cy="190" r="16" fill="#FFB6C1" opacity={0.5} />

      <G transform="rotate(-20 128 225)">
        <Ellipse cx="128" cy="225" rx="18" ry="12" fill="#1a1a1a" />
      </G>
      <G transform="rotate(20 272 225)">
        <Ellipse cx="272" cy="225" rx="18" ry="12" fill="#1a1a1a" />
      </G>

      <Circle cx="200" cy="115" r="6" fill="#2563eb" />
      <Path d="M200 109 Q205 95 210 100" fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" />
      <G transform="rotate(-30 212 97)">
        <Ellipse cx="212" cy="97" rx="5" ry="3" fill="#2563eb" />
      </G>
    </Svg>
  );
}
