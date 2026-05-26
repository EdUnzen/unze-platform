import { CommentForm } from "@/components/feed/CommentForm";
import { CommentList } from "@/components/feed/CommentList";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { PostViewRecorder } from "@/components/feed/PostViewRecorder";
import { ReportDialog } from "@/components/governance/ReportDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUser } from "@/services/auth/auth.service";
import { getPostComments } from "@/services/comments/comment.service";
import { getPostById } from "@/services/feed/feed.service";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const user = await getCurrentUser();
  const comments = await getPostComments(id);

  return (
    <div className="page-padding">
      <PostViewRecorder postId={id} />
      <div className="mb-4">
        <Link
          href={
            post.community ? `/community/${post.community.slug}` : "/discover?tab=feed"
          }
          className="text-sm font-medium text-unze-green"
        >
          ← Zurück
        </Link>
      </div>

      <PageHeader
        title={post.title ?? "Community-Beitrag"}
        subtitle={
          post.community
            ? `${post.community.title}${post.group ? ` · ${post.group.title}` : ""}`
            : "Öffentlicher Beitrag im UNZE-Netzwerk"
        }
      />

      <FeedPostCard
        post={post}
        isLoggedIn={Boolean(user)}
        variant="detail"
        showCommunity
      />

      {user && (
        <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-card">
          <div>
            <p className="text-sm font-semibold text-unze-ink">Vertrauen & Moderation</p>
            <p className="text-xs text-unze-ink-secondary">
              Community-Owner sind für externe Inhalte verantwortlich. UNZE kann bei
              Missbrauch moderieren oder sperren.
            </p>
          </div>
          <ReportDialog
            targetType="post"
            targetId={id}
            communityId={post.communityId}
            returnPath={`/post/${id}`}
            label="Beitrag melden"
          />
        </section>
      )}

      <section id="comments" className="mt-6 rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <header className="mb-4 border-b border-unze-border/80 pb-3">
          <h2 className="text-sm font-semibold text-unze-ink">
            Kommentare
          </h2>
          <p className="text-xs text-unze-ink-secondary">
            Diskussion im Community-Kontext — {post.commentCount}{" "}
            {post.commentCount === 1 ? "Antwort" : "Antworten"}
          </p>
        </header>
        <CommentList comments={comments} />
        {user ? (
          <div className="relative mt-4 border-t border-unze-border/80 pt-4">
            <CommentForm postId={id} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-unze-ink-secondary">
            <Link href="/auth/login" className="font-semibold text-unze-green">
              Anmelden
            </Link>
            , um zu kommentieren.
          </p>
        )}
      </section>
    </div>
  );
}
