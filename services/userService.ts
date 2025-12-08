import { User, Group } from "../types";
import { dbService } from "./db";

// --- User Methods ---

export const getUsers = async (): Promise<User[]> => {
  return await dbService.getAll('users');
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  const user = await dbService.getById('users', userId);
  return user || undefined;
};

export const updateUserInstruction = async (userId: string, instruction: string): Promise<User> => {
  const user = await dbService.getById('users', userId);
  if (!user) throw new Error("User not found");
  
  const updatedUser = {
    ...user,
    preferences: {
      ...user.preferences,
      nlq_instruction: instruction
    }
  };
  
  await dbService.upsert('users', updatedUser);
  return updatedUser;
};

export const updateUserProfile = async (user: User): Promise<User> => {
  await dbService.upsert('users', user);
  
  // Sync group memberships (Basic logic: iterate all groups)
  const groups = await getGroups();
  for (const group of groups) {
      let changed = false;
      const isMember = group.memberIds.includes(user.id);
      const shouldBeMember = user.groupIds?.includes(group.id);

      if (shouldBeMember && !isMember) {
          group.memberIds.push(user.id);
          changed = true;
      } else if (!shouldBeMember && isMember) {
          group.memberIds = group.memberIds.filter(id => id !== user.id);
          changed = true;
      }

      if (changed) {
          await dbService.upsert('groups', group);
      }
  }

  return user;
};

// --- Group Methods ---

export const getGroups = async (): Promise<Group[]> => {
  return await dbService.getAll('groups');
};

export const createGroup = async (group: Group): Promise<Group> => {
  await dbService.upsert('groups', group);
  return group;
};

export const updateGroup = async (group: Group): Promise<Group> => {
  await dbService.upsert('groups', group);

  // Sync users
  const users = await getUsers();
  for (const user of users) {
      const isMember = group.memberIds.includes(user.id);
      const hasGroupId = user.groupIds?.includes(group.id);
      let changed = false;

      if (isMember && !hasGroupId) {
          user.groupIds = [...(user.groupIds || []), group.id];
          changed = true;
      } else if (!isMember && hasGroupId) {
          user.groupIds = user.groupIds?.filter(gid => gid !== group.id);
          changed = true;
      }
      
      if(changed) await dbService.upsert('users', user);
  }

  return group;
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  await dbService.delete('groups', groupId);

  // Remove from users
  const users = await getUsers();
  for (const user of users) {
      if (user.groupIds?.includes(groupId)) {
          user.groupIds = user.groupIds.filter(id => id !== groupId);
          await dbService.upsert('users', user);
      }
  }
};