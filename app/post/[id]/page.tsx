import { CommentForm } from "@/components/feed/CommentForm";
import { CommentList } from "@/components/feed/CommentList";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
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
        title={post.title ?? "Beitrag"}
        subtitle={
          post.community
            ? `In ${post.community.title}`
            : "Öffentlicher Beitrag im UNZE-Netzwerk"
        }
      />

      <FeedPostCard
        post={post}
        isLoggedIn={Boolean(user)}
        showCommunity={Boolean(post.community)}
      />

      <section id="comments" className="mt-6 rounded-3xl bg-white p-4 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-unze-ink">
          Kommentare ({post.commentCount})
        </h2>
        <CommentList comments={comments} />
        {user ? (
          <div className="relative mt-4">
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
