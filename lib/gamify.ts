// Define how much XP is needed for each level
// Formula: 100 * (level ^ 1.5) creates a nice difficulty curve
export const getXpForLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5));

export async function addXpToUser(prisma: any, userId: string, xpToAdd: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, name: true }
  });

  if (!user) return null;

  let newXp = user.xp + xpToAdd;
  let newLevel = user.level;
  let leveledUp = false;

  // Check if they leveled up (could be multiple levels if xpToAdd is huge)
  while (newXp >= getXpForLevel(newLevel)) {
    newXp -= getXpForLevel(newLevel);
    newLevel++;
    leveledUp = true;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
    }
  });

  return {
    updatedUser,
    leveledUp,
    xpGained: xpToAdd,
    currentLevel: newLevel
  };
}