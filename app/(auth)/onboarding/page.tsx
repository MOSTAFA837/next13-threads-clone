import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs";

async function page() {
  const authUser = await currentUser();
  const userInfo = {};

  const userData = {
    id: authUser?.id,
    objectId: userInfo?._id,
    username: userInfo?.username || authUser?.username,
    name: userInfo?.name || authUser?.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || authUser?.imageUrl,
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Onboarding</h1>

      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile to use threads
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default page;
