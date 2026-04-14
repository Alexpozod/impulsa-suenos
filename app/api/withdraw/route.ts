export async function POST() {
  return new Response(
    JSON.stringify({ error: "Endpoint deprecated. Use /api/payout/request" }),
    { status: 410 }
  );
}