// pages/AdminModeration.jsx — review pending listings
const AdminModeration = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ⚠️ IMPORTANT: Gate this page — only YOU should access it
  const { user } = useAuth();
  const ADMIN_IDS = ["your-user-id-here"]; // ⭐ your UUID
  if (!user || !ADMIN_IDS.includes(user.id)) {
    return <div className="p-8 text-center">Access denied</div>;
  }

  const fetchPending = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select(`
        id, title, description, price, category, city, area,
        contact_number, images, cover_image, specs, created_at, user_id
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);
    setPending(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (listing) => {
    await supabase
      .from("listings")
      .update({
        status: "active",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", listing.id);

    // ⭐ Notify the seller
    await supabase.from("notifications").insert({
      user_id: listing.user_id,
      type: "listing_approved",
      title: "Your ad is live! 🎉",
      message: `"${listing.title}" has been approved and is now visible to buyers.`,
      related_listing_id: listing.id,
    });

    setPending((p) => p.filter((x) => x.id !== listing.id));
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;
    const listing = rejectModal;

    await supabase
      .from("listings")
      .update({
        status: "rejected",
        moderation_notes: rejectReason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", listing.id);

    await supabase.from("notifications").insert({
      user_id: listing.user_id,
      type: "listing_rejected",
      title: "Ad needs changes",
      message: `"${listing.title}" was rejected: ${rejectReason}`,
      related_listing_id: listing.id,
    });

    setPending((p) => p.filter((x) => x.id !== listing.id));
    setRejectModal(null);
    setRejectReason("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Moderation Queue</h1>
        <p className="text-gray-600 mb-6">
          {pending.length} listing{pending.length !== 1 ? "s" : ""} pending review
        </p>

        {loading ? (
          <div className="text-center py-20">Loading…</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            🎉 No pending listings — you're all caught up!
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl p-4 flex gap-4">
                {listing.cover_image && (
                  <img
                    src={listing.cover_image}
                    alt={listing.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-500">
                    {listing.category} · {listing.city}
                    {listing.area ? ` · ${listing.area}` : ""}
                  </p>
                  <p className="text-lg font-bold text-orange-600 mt-1">
                    Rs {Number(listing.price).toLocaleString()}
                  </p>
                  {listing.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Posted {new Date(listing.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => approve(listing)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => setRejectModal(listing)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold"
                  >
                    ✕ Reject
                  </button>
                  <a
                    href={`/listing/${listing.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2 border border-gray-300 rounded-lg font-bold text-center"
                  >
                    Preview
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject modal */}
        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="font-bold text-lg mb-2">Reject "{rejectModal.title}"</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why is this rejected? (seller will see this)"
                rows={4}
                className="w-full border rounded-lg p-3 mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(""); }}
                  className="flex-1 py-2 border rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={reject}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold"
                >
                  Reject Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};