import { fetchThreads } from "@/lib/actions/thread.actions";

export default async function Home() {
  const { threads, isNextThreads } = await fetchThreads(1, 20);

  return (
    <div className="">
      <h1>Home</h1>
    </div>
  );
}
