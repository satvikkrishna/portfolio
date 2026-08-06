import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const YEAR = 60 * 60 * 24 * 365;

export function isAbsoluteUrl(value?: string | null) {
  return !!value && /^(https?:|data:|blob:)/i.test(value);
}

/**
 * Values stored in the database are either an absolute URL (pasted link) or a
 * path inside the private `media` storage bucket. Bucket paths are turned into
 * signed URLs on demand.
 */
export function useMediaUrl(value?: string | null) {
  const enabled = !!value && !isAbsoluteUrl(value);

  const { data } = useQuery({
    queryKey: ["media-url", value],
    enabled,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .createSignedUrl(value as string, YEAR);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  if (!value) return undefined;
  if (isAbsoluteUrl(value)) return value;
  return data;
}

export function MediaImage({
  value,
  alt,
  className,
  loading = "lazy",
}: {
  value?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const url = useMediaUrl(value);
  if (!url) return null;
  return <img src={url} alt={alt} className={className} loading={loading} />;
}

export function MediaVideo({
  value,
  className,
  poster,
}: {
  value?: string | null;
  className?: string;
  poster?: string;
}) {
  const url = useMediaUrl(value);
  if (!url) return null;

  const youTube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
  if (youTube) {
    return (
      <iframe
        className={className}
        src={`https://www.youtube.com/embed/${youTube[1]}`}
        title="Project demo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return (
      <iframe
        className={className}
        src={`https://player.vimeo.com/video/${vimeo[1]}`}
        title="Project demo"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return <video className={className} src={url} poster={poster} controls playsInline preload="metadata" />;
}
