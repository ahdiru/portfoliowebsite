import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase";
import {
  MessageSquare,
  Pin,
  Trash2,
  PinOff,
  Calendar,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl shadow-xs overflow-hidden ${className}`}>
    {children}
  </div>
);

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("portfolio_comments")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const pin = async (id, value) => {
    await supabase
      .from("portfolio_comments")
      .update({ is_pinned: value })
      .eq("id", id);
    fetchComments();
  };

  const remove = async (id) => {
    if (!confirm("Delete this comment?")) return;
    await supabase.from("portfolio_comments").delete().eq("id", id);
    fetchComments();
  };

  const pinnedCount = comments.filter((c) => c.is_pinned).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filtered = useMemo(() => {
    let result =
      filter === "pinned" ? comments.filter((c) => c.is_pinned) : comments;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          (c.user_name || "").toLowerCase().includes(q) ||
          (c.content || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [comments, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl flex items-center justify-center text-[#1E3B2F] shadow-2xs">
            <MessageSquare className="w-5 h-5 text-[#1E3B2F]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E3B2F] font-mono">
              Comments & Guestbook
            </h1>
            <p className="text-[#5A6650] text-xs font-mono">
              {comments.length} total · {pinnedCount} pinned
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#EDE7DA] border border-[#D8CFBE]">
          {[
            { value: "all", label: "All", count: comments.length },
            { value: "pinned", label: "Pinned", count: pinnedCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                filter === tab.value
                  ? "bg-[#1E3B2F] text-[#F5F0E6] shadow-xs"
                  : "text-[#5A6650] hover:text-[#1E3B2F]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === tab.value
                    ? "bg-[#7F8C6A] text-[#F5F0E6]"
                    : "bg-[#D8CFBE] text-[#1E3B2F]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Received", value: comments.length, color: "text-[#1E3B2F]" },
          { label: "Pinned Messages", value: pinnedCount, color: "text-[#7F8C6A]" },
          {
            label: "Regular Feed",
            value: comments.length - pinnedCount,
            color: "text-[#5A6650]",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="p-4 sm:p-5">
              <p className="text-[#5A6650] text-xs font-mono uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl sm:text-3xl font-bold font-mono ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7F8C6A] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by visitor name or message content..."
          className="w-full bg-[#FFFFFF] border border-[#D8CFBE] rounded-xl pl-10 pr-10 py-2.5 text-[#1E3B2F] placeholder-[#5A6650]/60 text-sm outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all shadow-2xs"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6650] hover:text-[#1E3B2F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#1E3B2F]/20 border-t-[#1E3B2F] rounded-full animate-spin" />
        </div>
      ) : paginated.length === 0 ? (
        <Card>
          <div className="p-14 text-center">
            <MessageSquare className="w-10 h-10 text-[#7F8C6A] mx-auto mb-3 opacity-60" />
            <p className="text-[#1E3B2F] font-semibold text-sm">
              {search
                ? "No comments match your search query."
                : filter === "pinned"
                  ? "No pinned comments found."
                  : "No guestbook messages yet."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((comment) => (
            <div
              key={comment.id}
              className={`bg-[#FFFFFF] border rounded-2xl px-4 py-4 sm:px-5 transition-all shadow-xs ${
                comment.is_pinned
                  ? "border-[#C8B48A] bg-[#EDE7DA]/40"
                  : "border-[#D8CFBE] hover:border-[#7F8C6A]"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full border border-[#D8CFBE] bg-[#EDE7DA] flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={comment.profile_image || "/default-avatar.jpg"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-[#1E3B2F]">
                      {highlightMatch(comment.user_name || "Anonymous", search)}
                    </span>
                    {comment.is_pinned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E3B2F] text-[#F5F0E6] text-[10px] font-mono">
                        <Pin className="w-2.5 h-2.5 text-[#C8B48A]" /> Pinned
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[#5A6650] text-xs font-mono ml-auto shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-[#1E3B2F] text-sm leading-relaxed">
                    {highlightMatch(comment.content || "", search)}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => pin(comment.id, !comment.is_pinned)}
                    title={comment.is_pinned ? "Unpin message" : "Pin message"}
                    className={`p-2 rounded-lg border transition-all ${
                      comment.is_pinned
                        ? "border-[#C8B48A] bg-[#1E3B2F] text-[#F5F0E6]"
                        : "border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]"
                    }`}
                  >
                    {comment.is_pinned ? (
                      <PinOff className="w-3.5 h-3.5 text-[#C8B48A]" />
                    ) : (
                      <Pin className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => remove(comment.id)}
                    title="Delete message"
                    className="p-2 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#B4442E] hover:border-[#B4442E]/30 hover:bg-[#EDE7DA] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs font-mono text-[#5A6650]">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono border transition-all ${
                    page === p
                      ? "bg-[#1E3B2F] border-[#1E3B2F] text-[#F5F0E6] font-bold"
                      : "border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]"
                  }`}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[#D8CFBE] text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#C8B48A]/40 text-[#1E3B2F] rounded px-0.5 font-semibold">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
