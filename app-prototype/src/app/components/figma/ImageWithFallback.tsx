import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export function ImageWithFallback({ fallbackClassName, className, alt, ...rest }: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${fallbackClassName ?? className ?? ''}`}
      >
        <ImageOff className="w-1/3 h-1/3" />
      </div>
    );
  }

  return <img className={className} alt={alt} onError={() => setErrored(true)} {...rest} />;
}
