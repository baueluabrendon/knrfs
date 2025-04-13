
import { supabaseAdmin } from "@/integrations/supabase/adminClient";

/**
 * Fetches signed URLs for letterhead images stored in Supabase.
 */
export const fetchLetterheadUrls = async () => {
  const { data, error } = await supabaseAdmin.storage
    .from("application_documents")
    .createSignedUrls(
      ["letterhead/Header_tiled.jpg", "letterhead/Footer_tiled.jpg"],
      60 * 60 * 24 * 7 // 7 days
    );

  if (error || !data || data.length < 2) {
    throw new Error("Unable to fetch signed header/footer URLs");
  }

  return {
    headerUrl: data[0].signedUrl,
    footerUrl: data[1].signedUrl,
  };
};
