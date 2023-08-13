import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function page({ params }: { params: { id: string } }) {
  const user = await currentUser();

  if (!params.id || !user) return;

  const userInfo = await fetchUser(user.id);
  if (!userInfo.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <ThreadCard
        key={thread._id}
        id={thread._id}
        currentUserId={user?.id}
        parentId={thread.parentId}
        community={thread.community}
        content={thread.text}
        author={thread.author}
        createdAt={thread.createdAt}
        comments={thread.children}
      />

      <Comment
        currentUserImg={userInfo.image}
        currentUserId={JSON.stringify(userInfo._id)}
        threadId={params.id}
      />
    </section>
  );
}
