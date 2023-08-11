"use client";

import { sidebarLinks } from "@/constants";
import { SignedIn, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`${isActive && "bg-white/10"} leftsidebar_link`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />

              <p className="text-light-1 max-lg:hidden">{link.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 px-6 border-t-2 border-white/20  gap-4 p-4">
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push("/sign-in")}>
            <div className="flex cursor-pointer gap-4 p-4 hover:bg-white/10 rounded-lg">
              <Image
                src={`/assets/logout.svg`}
                alt="logout"
                width={24}
                height={24}
              />

              <p className="text-light-2 max-lg:hidden">Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
}

export default LeftSidebar;
