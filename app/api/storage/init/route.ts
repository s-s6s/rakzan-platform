import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const { bucket } = await request.json();
    if (!bucket) {
      return NextResponse.json({ error: "Bucket name required" }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    );

    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucket);

    if (!exists) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, bucket });
  } catch (error) {
    console.error("Storage init error:", error);
    return NextResponse.json({ error: "Failed to initialize storage" }, { status: 500 });
  }
}
