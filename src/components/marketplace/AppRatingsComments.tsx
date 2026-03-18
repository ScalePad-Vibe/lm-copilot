import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Star, Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Rating {
  id: string;
  app_id: string;
  user_hash: string;
  rating: number;
  created_at: string;
}

interface Comment {
  id: string;
  app_id: string;
  user_hash: string;
  content: string;
  created_at: string;
}

interface Props {
  appId: string;
}

export function AppRatingsComments({ appId }: Props) {
  const { userHash, role, isAuthenticated } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [myRating, setMyRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [ratingsRes, commentsRes] = await Promise.all([
      supabase.from("app_ratings").select("*").eq("app_id", appId),
      supabase.from("app_comments").select("*").eq("app_id", appId).order("created_at", { ascending: false }),
    ]);

    if (ratingsRes.data) {
      setRatings(ratingsRes.data as Rating[]);
      const mine = (ratingsRes.data as Rating[]).find((r) => r.user_hash === userHash);
      if (mine) setMyRating(mine.rating);
    }
    if (commentsRes.data) {
      setComments(commentsRes.data as Comment[]);
    }
  }, [appId, userHash]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const handleRate = async (value: number) => {
    if (!userHash || role === "admin") return;
    setSubmittingRating(true);
    try {
      const { error } = await supabase.functions.invoke("app-feedback", {
        body: { action: "rate", app_id: appId, user_hash: userHash, rating: value },
      });
      if (error) throw error;
      setMyRating(value);
      await loadData();
    } catch (e) {
      toast({ title: "Failed to submit rating", variant: "destructive" });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !userHash || role === "admin") return;
    setSubmittingComment(true);
    try {
      const { error } = await supabase.functions.invoke("app-feedback", {
        body: { action: "comment", app_id: appId, user_hash: userHash, content: commentText.trim() },
      });
      if (error) throw error;
      setCommentText("");
      await loadData();
      toast({ title: "Comment added" });
    } catch (e) {
      toast({ title: "Failed to add comment", variant: "destructive" });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingComment(commentId);
    try {
      const { error } = await supabase.functions.invoke("app-feedback", {
        body: { action: "delete_comment", app_id: appId, comment_id: commentId },
      });
      if (error) throw error;
      await loadData();
      toast({ title: "Comment deleted" });
    } catch (e) {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    } finally {
      setDeletingComment(null);
    }
  };

  const isUser = role === "user" && isAuthenticated && !!userHash;
  const isAdmin = role === "admin";

  return (
    <div className="space-y-6">
      {/* Ratings Section */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-heading font-bold text-sm text-foreground mb-3">Ratings</h3>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.round(avgRating) ? "fill-warning text-warning" : "text-muted-foreground"}`}
              />
            ))}
          </div>
          <span className="text-sm text-foreground font-medium">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </span>
          <span className="text-xs text-muted-foreground">
            ({ratings.length} rating{ratings.length !== 1 ? "s" : ""})
          </span>
        </div>

        {isUser && (
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2">
              {myRating > 0 ? "Your rating (click to update):" : "Rate this app:"}
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={submittingRating}
                  className="disabled:opacity-50 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || myRating)
                        ? "fill-warning text-warning"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {submittingRating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Comments ({comments.length})
          </h3>
        </div>

        {/* Add Comment (user only) */}
        {isUser && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment…"
              maxLength={500}
              className="flex-1 h-9 px-3 bg-surface-raised border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || submittingComment}
              className="h-9 px-3 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-md flex items-center gap-1.5 text-xs font-medium"
            >
              {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send
            </button>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No comments yet.</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="bg-surface-raised border border-border rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {comment.user_hash.slice(0, 8)}…
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingComment === comment.id}
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      {deletingComment === comment.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
