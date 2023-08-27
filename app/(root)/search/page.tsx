import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const user = await currentUser();

  if (!user) return;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const res = await fetchUsers({
    userId: user.id,
    searchString: "",
    page: 1,
    limit: 25,
  });

  return (
    <section>
      <h1 className="head-text">Search</h1>

      <div className="mt-14 flex flex-col gap-9">
        {res.users.length === 0 ? (
          <p className="no-result">No users found</p>
        ) : (
          <>
            {res.users.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                username={user.username}
                imgUrl={user.image}
                userType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
