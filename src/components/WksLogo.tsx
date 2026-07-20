interface WksLogoProps {
  className?: string;
  color?: string;
  size?: number;
}

export function WksLogo({ className, color = '#00F2FF', size = 80 }: WksLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M66.6658 0V26.6658H53.3342V40H40V26.6658H26.6658V40H13.3342V26.6658H0V0H13.3342V13.3342H26.6658V0H40V13.3342H53.3342V0H66.6658Z"
        fill={color}
      />
      <path d="M39.9983 40H26.6641V53.3342H39.9983V40Z" fill={color} />
      <path
        d="M26.6658 53.3342V66.6658H13.3342V80H0V40H13.3342V53.3342H26.6658Z"
        fill={color}
      />
      <path
        d="M66.6641 40H53.3324V53.3342V66.6658H39.9983H26.6641V80H39.9983H53.3324H66.6641V66.6658V53.3342H79.9983V40H66.6641Z"
        fill={color}
      />
    </svg>
  );
}
