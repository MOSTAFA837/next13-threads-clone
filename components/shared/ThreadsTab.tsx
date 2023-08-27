import { redirect } from "next/navigation";
import React from "react";
import ThreadCard from "../cards/ThreadCard";
import { fetchUserThreads } from "@/lib/actions/user.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

export default async function ThreadsTab({
  currentUserId,
  accountId,
  accountType,
}: Props) {
  let user = await fetchUserThreads(accountId);

  if (!user) return redirect("/");

  return (
    <div className="mt-9 flex flex-col gap-10">
      {user.threads.map((thread: any) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          author={
            accountType === "User"
              ? {
                  name: user.name,
                  image: user.image,
                  id: user.id,
                }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                }
          }
          community={thread.community}
          content={thread.text}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </div>
  );
}
