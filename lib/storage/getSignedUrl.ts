export async function getSignedUrl(
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    const res = await fetch("/api/storage/signed-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bucket, path }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Signed URL error:", data.error);
      return null;
    }

    return data.url;
  } catch (err) {
    console.error("Signed URL fetch failed", err);
    return null;
  }
}