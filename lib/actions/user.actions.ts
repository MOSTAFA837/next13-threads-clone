"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface updateUserParams {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

interface fetchUsersParams {
  userId: string;
  searchString?: string;
  page?: number;
  limit?: number;
  sortBy?: SortOrder;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: updateUserParams): Promise<void> {
  connectDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLocaleLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    } else {
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(UserId: string) {
  try {
    connectDB();

    return await User.findOne({ id: UserId });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectDB();

    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });

    return threads;
  } catch (error: any) {
    throw new Error(`Unable to fetch thread due to ${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  page = 1,
  limit = 20,
  sortBy = "desc",
}: fetchUsersParams) {
  try {
    connectDB();

    const skip = (page - 1) * limit;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const usersQuery = User.find(query)
      .sort({ createdAt: sortBy })
      .skip(skip)
      .limit(limit);

    const totalusersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();
    const isNext = totalusersCount > skip + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users due to ${error.message}`);
  }
}
