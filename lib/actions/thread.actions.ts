"use server";

import { auth } from "@clerk/nextjs";
import { connectDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import Thread from "../models/thread.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectDB();

    const thread = await Thread.create({
      text,
      author,
      community: communityId || null,
    });

    // update user threads
    await User.findByIdAndUpdate(author, {
      $push: { threads: thread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
