import { db } from "../src/server/db";
import { tools } from "../src/lib/ai_tools";

async function populateTools() {
  const toolsToProcess = tools.slice(0, 1000);
  console.log(`Starting to populate ${toolsToProcess.length} tools (limited from ${tools.length} total)...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const tool of toolsToProcess) {
    try {
      // Create tool
      const newTool = await db.tool.create({
        data: {
          description: (tool as any).description,
          name: (tool as any).tool_name,
          url: (tool as any)["Link to tool"],
          image: (tool as any).logo_url,
          pricing: (tool as any).pricing ?? "No data",
        },
      });
      
      console.log(`✅ Created tool: ${(tool as any).tool_name}`);
      
      // Handle tags
      if (typeof (tool as any).other_tags !== "string" && Array.isArray((tool as any).other_tags)) {
        for (const tag of (tool as any).other_tags) {
          // Upsert tag
          await db.tag.upsert({
            where: { name: tag },
            create: { name: tag, uses: 1 },
            update: { uses: { increment: 1 } },
          });
          
          // Create tool-tag relationship
          await db.toolTags.upsert({
            where: {
              toolId_tag: {
                tag: tag,
                toolId: newTool.id,
              },
            },
            create: {
              tag: tag,
              toolId: newTool.id,
            },
            update: {},
          });
        }
      }
      
      successCount++;
    } catch (error) {
      console.log(`❌ Error with tool ${(tool as any).tool_name}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 Completed! Success: ${successCount}, Errors: ${errorCount}`);
}

populateTools()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  }); 