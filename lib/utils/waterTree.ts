// Define your growth milestones
const GROWTH_STAGES = {
  SEED: 0,
  SPROUT: 10,
  SAPLING: 30,
  YOUNG_TREE: 60,
  MATURE_TREE: 100,
};

export async function waterTree(prisma: any, userId: string, xpGained: number) {
  // 1. Find the user's active tree
  const tree = await prisma.progressTree.findFirst({
    where: { 
      userId: userId,
      type: "overall", // or "habit" based on your preference
    }
  });

  if (!tree) {
    // If no tree exists, create a 'Seed' for the user
    return await prisma.progressTree.create({
      data: {
        userId,
        type: "overall",
        growthLevel: 0,
        trees: ["Seed"], // Initial stage
        status: "Healthy",
      }
    });
  }

  // 2. Logic: How much does XP affect Growth?
  // Let's say 10% of XP gained converts to 'Growth Points'
  const growthIncrement = Math.floor(xpGained * 0.1); 
  const newGrowthLevel = tree.growthLevel + growthIncrement;

  // 3. Check for "Evolution"
  let newStatus = tree.status;
  if (newGrowthLevel >= GROWTH_STAGES.MATURE_TREE) {
    newStatus = "Ancient";
  } else if (newGrowthLevel >= GROWTH_STAGES.YOUNG_TREE) {
    newStatus = "Vibrant";
  }

  // 4. Update the Database
  const updatedTree = await prisma.progressTree.update({
    where: { id: tree.id },
    data: {
      growthLevel: { increment: growthIncrement },
      lastWatered: new Date(),
      status: newStatus,
      // If growth level crosses a milestone, you could push a new stage to the 'trees' Json array
    }
  });

  return {
    updatedTree,
    didEvolve: getStage(newGrowthLevel) !== getStage(tree.growthLevel)
  };
}

// Helper to determine the current visual stage
function getStage(level: number) {
  if (level >= GROWTH_STAGES.MATURE_TREE) return "Mature Tree";
  if (level >= GROWTH_STAGES.YOUNG_TREE) return "Young Tree";
  if (level >= GROWTH_STAGES.SAPLING) return "Sapling";
  if (level >= GROWTH_STAGES.SPROUT) return "Sprout";
  return "Seed";
}