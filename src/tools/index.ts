import { executeCaptureLead } from './capture-lead.js';
import { executeBookMeeting } from './book-meeting.js';

export { AGENT_TOOLS } from './schemas.js';

export async function executeTool(toolName: string, toolArgs: unknown): Promise<string> {
  console.log(`[TOOL CALL] Executing tool: ${toolName} with args:`, toolArgs);

  switch (toolName) {
    case 'capture_lead':
      return await executeCaptureLead(toolArgs);
    case 'book_meeting':
      return await executeBookMeeting(toolArgs);
    default:
      console.warn(`[WARN] Unknown tool name called: ${toolName}`);
      return `Tool ${toolName} is not supported.`;
  }
}
