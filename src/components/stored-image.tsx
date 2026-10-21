import { useEffect, useState } from "react";
import { Image, View, type ImageStyle, type StyleProp } from "react-native";
import { getBytes, getMetadata, ref } from "firebase/storage";
import { storage } from "@/services/firebase";
export function StoredImage({
  path,
  style,
  fallback,
  label = "Imagem",
}: {
  path?: string | null;
  style: StyleProp<ImageStyle>;
  fallback?: React.ReactNode;
  label?: string;
}) {
  const [uri, setUri] = useState("");
  useEffect(() => {
    let alive = true;
    setUri("");
    if (path) {
      const r = ref(storage, path);
      Promise.all([getBytes(r, 5 * 1024 * 1024), getMetadata(r)])
        .then(([data, meta]) => {
          let b = "";
          for (const n of new Uint8Array(data)) b += String.fromCharCode(n);
          if (alive) setUri(`data:${meta.contentType};base64,${btoa(b)}`);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [path]);
  return uri ? (
    <Image
      accessibilityLabel={label}
      source={{ uri }}
      style={style}
      onError={() => setUri("")}
    />
  ) : (
    <View style={style}>{fallback}</View>
  );
}
