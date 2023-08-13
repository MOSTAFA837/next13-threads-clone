import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  const { threads, isNextThreads } = await fetchThreads(1, 20);

  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Threads feed</h1>

      <section>
        {threads.length ? (
          <div className="mt-9 flex flex-col gap-10">
            {threads.map((thread) => (
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
            ))}
          </div>
        ) : (
          ""
        )}
      </section>
    </>
  );
}
