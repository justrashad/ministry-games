interface WordmarkProps {
  size?: 'sm' | 'md' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'text-[clamp(1rem,1.6vw,1.6rem)]',
  md: 'text-4xl sm:text-5xl',
  xl: 'text-[clamp(3rem,9vw,9rem)]',
};

/** The game's lettering. Two stacked words, lit like a stage sign. */
export function Wordmark({ size = 'md', className = '' }: WordmarkProps) {
  if (size === 'sm') {
    return (
      <span className={`wordmark whitespace-nowrap ${SIZES.sm} ${className}`} style={{ textShadow: '0 2px 0 #b27808' }}>
        Ministry Showdown
      </span>
    );
  }
  return (
    <span className={`wordmark inline-flex flex-col items-center ${SIZES[size]} ${className}`}>
      <span className="text-[0.55em] tracking-[0.12em] text-cream" style={{ textShadow: '0 3px 0 #3c2fa6' }}>
        Ministry
      </span>
      <span>Showdown</span>
    </span>
  );
}
