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

export async function fetchThreads(page = 1, size = 20) {
  connectDB();

  const skip = (page - 1) * size;

  // fetch top level threads which not a comment
  const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({
      createdAt: "desc",
    })
    .skip(skip)
    .limit(size)
    .populate({
      path: "author",
      model: "User",
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: "User",
        select: "_id name parentId image",
      },
    });

  const threadsLength = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const threads = await threadsQuery.exec();
  const isNextThreads = threadsLength > skip + threads.length;

  return { threads, isNextThreads };
}
