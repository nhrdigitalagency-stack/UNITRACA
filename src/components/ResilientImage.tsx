import { useState } from 'react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectClass?: string;
  loading?: 'lazy' | 'eager';
}

export function ResilientImage({
  src,
  alt,
  caption,
  className = '',
  aspectClass = 'aspect-[4/3]',
  loading = 'lazy',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="m-0">
      <div
        className={`relative overflow-hidden bg-[var(--color-ivory-soft)] border border-[var(--color-ivory-border)] ${aspectClass} ${className}`}
      >
        {src && !failed ? (
          <img
            src={src}
            alt={alt}
            loading={loading}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center hairline-grid-bg">
            <span className="font-display text-2xl font-semibold text-[var(--color-earth-dark)] tracking-wide">
              UNITRACA
            </span>
            <span className="text-xs text-[var(--color-muted)] mt-2 max-w-[24ch]">{alt}</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="text-xs font-display italic text-[var(--color-muted)] mt-2 leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
