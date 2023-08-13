"use server";

import { auth } from "@clerk/nextjs";
import { connectDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import { threadId } from "worker_threads";

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

export async function fetchThreadById(id: string) {
  connectDB();

  try {
    return await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        model: Thread,
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      });
  } catch (error: any) {
    throw new Error(`Unable to fetch thread due to ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectDB();

  try {
    // find the parent thread
    const parentThread = await Thread.findById(threadId);
    if (!parentThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = await new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    }).save();

    // Save the comment thread to the database
    // const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    parentThread.children.push(commentThread._id);

    // Save the updated original thread to the database
    await parentThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Unable to fetch thread due to ${error.message}`);
  }
}
