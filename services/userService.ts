import { User, Group } from "../types";
import { MOCK_USERS, MOCK_GROUPS } from "../constants";

// Simulating backend database
let usersStore = [...MOCK_USERS];
let groupsStore = [...MOCK_GROUPS];

// --- User Methods ---

export const getUsers = async (): Promise<User[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return usersStore;
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return usersStore.find(u => u.id === userId);
};

export const updateUserInstruction = async (userId: string, instruction: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userIndex = usersStore.findIndex(u => u.id === userId);
  if (userIndex === -1) throw new Error("User not found");
  
  const updatedUser = {
    ...usersStore[userIndex],
    preferences: {
      ...usersStore[userIndex].preferences,
      nlq_instruction: instruction
    }
  };
  
  usersStore[userIndex] = updatedUser;
  return updatedUser;
};

export const updateUserProfile = async (user: User): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const idx = usersStore.findIndex(u => u.id === user.id);
  if (idx === -1) throw new Error("User not found");
  usersStore[idx] = user;
  
  // Sync group memberships (if user was added/removed from groups in user profile, update groupsStore)
  // Note: For full consistency in a real app, this would be transactional.
  // Here we assume the UI handles the group-member relationship via the group APIs mostly,
  // but if updated from User side, we should reflect it.
  if (user.groupIds) {
      groupsStore.forEach(g => {
          if (user.groupIds?.includes(g.id) && !g.memberIds.includes(user.id)) {
              g.memberIds.push(user.id);
          } else if (!user.groupIds?.includes(g.id) && g.memberIds.includes(user.id)) {
              g.memberIds = g.memberIds.filter(id => id !== user.id);
          }
      });
  }

  return user;
};

// --- Group Methods ---

export const getGroups = async (): Promise<Group[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return groupsStore;
};

export const createGroup = async (group: Group): Promise<Group> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  groupsStore.push(group);
  return group;
};

export const updateGroup = async (group: Group): Promise<Group> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const idx = groupsStore.findIndex(g => g.id === group.id);
  if (idx === -1) throw new Error("Group not found");
  groupsStore[idx] = group;

  // Sync users (add groupId to users)
  usersStore.forEach(u => {
      const isMember = group.memberIds.includes(u.id);
      const hasGroupId = u.groupIds?.includes(group.id);

      if (isMember && !hasGroupId) {
          u.groupIds = [...(u.groupIds || []), group.id];
      } else if (!isMember && hasGroupId) {
          u.groupIds = u.groupIds?.filter(gid => gid !== group.id);
      }
  });

  return group;
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  groupsStore = groupsStore.filter(g => g.id !== groupId);
  // Remove from users
  usersStore.forEach(u => {
      if (u.groupIds?.includes(groupId)) {
          u.groupIds = u.groupIds.filter(id => id !== groupId);
      }
  });
};
