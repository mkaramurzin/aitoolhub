import { db } from "../src/server/db";
import { tools } from "../src/lib/ai_tools";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function populateTools() {
  const toolsToProcess = tools.slice(0, 100);
  console.log(`Starting to populate ${toolsToProcess.length} tools (limited from ${tools.length} total)...`);
  
  let successCount = 0;
  let errorCount = 0;
  const batchSize = 10; // Process in smaller batches to avoid API rate limits
  
  for (let i = 0; i < toolsToProcess.length; i += batchSize) {
    const batch = toolsToProcess.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toolsToProcess.length / batchSize)} (${batch.length} tools)`);
    
    for (const tool of batch) {
      try {
        // Create tool
        const newTool = await db.tool.create({
          data: {
            description: (tool as any).description,
          //   summary: (tool as any).summary ?? "",
            name: (tool as any).tool_name,
            url: (tool as any)["Link to tool"],
            image: (tool as any).logo_url,
            pricing: (tool as any).pricing ?? "No data",
            slug: generateSlug((tool as any).tool_name),
          },
        });
        
        console.log(`✅ Created tool: ${(tool as any).tool_name}`);
        
        // Handle tags
        const toolTags: string[] = [];
        if (typeof (tool as any).other_tags !== "string" && Array.isArray((tool as any).other_tags)) {
          for (const tag of (tool as any).other_tags) {
            toolTags.push(tag);
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
        
        // Generate embedding for magic search
        const prompt = `
          Name: ${newTool.name};
          Description: ${newTool.description};
          Tags: ${toolTags.join(", ")};
          Pricing: ${newTool.pricing};
        `;

        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: prompt.trim(),
        });

        await db.$executeRaw`
          UPDATE "Tool"
          SET vector = ${embedding}::vector
          WHERE id = ${newTool.id}
        `;

        console.log(`🔮 Generated embedding for: ${newTool.name}`);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Error with tool ${(tool as any).tool_name}:`, error);
        errorCount++;
      }
    }
    
    // Add a small delay between batches to avoid API rate limits
    if (i + batchSize < toolsToProcess.length) {
      console.log(`⏳ Waiting 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
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