import { createClient } from "@/lib/supabase/client";

export async function uploadToCvMedia(file: File, folder: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("cv-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("cv-media").getPublicUrl(path);
  return data.publicUrl;
}
