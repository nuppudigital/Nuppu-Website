import { useEffect, useState } from 'react';

/** Creates an object URL for a File/Blob and revokes it on change/unmount. */
export function useObjectUrl(source: File | Blob | null | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!source) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(source);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [source]);

  return url;
}
