import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function generateAReview(prompt: string) {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: '',
    prompt,
  });
  return text;
}
