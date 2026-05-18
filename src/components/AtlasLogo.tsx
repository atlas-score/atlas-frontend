import {cn} from '../lib/cn';

const LOGO_TRANSPARENT = 'ATLAS-Logo-1.5k-transparent.webp';

/** Header logo rest size (rem); hover slot is 2× this */
export const HEADER_LOGO_SIZE_REM = 2.75;

function logoUrl(file: string): string {
    return `${import.meta.env.BASE_URL}${file}`;
}

interface AtlasLogoProps {
    variant?: 'header' | 'hero';
    className?: string;
    alt?: string;
}

export function AtlasLogo({
                              variant = 'header',
                              className,
                              alt = 'ATLAS',
                          }: AtlasLogoProps) {
    const src = logoUrl(LOGO_TRANSPARENT);
    // variant === 'hero' ? logoUrl(LOGO_COLOURED) : logoUrl(LOGO_TRANSPARENT);

    if (variant === 'hero') {
        return (
            <img
                src={src}
                alt={alt}
                className={cn('w-full object-contain', className)}
                decoding="async"
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={cn('h-full w-full max-h-full max-w-full object-contain', className)}
            decoding="async"
        />
    );
}
