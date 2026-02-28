'use server';
/**
 * @fileOverview Provides actionable advice on inventory optimization and basic marketing strategies based on inventory data.
 *
 * - aiInventoryMarketingAdvice - A function that handles the generation of inventory and marketing advice.
 * - AiInventoryMarketingAdviceInput - The input type for the aiInventoryMarketingAdvice function.
 * - AiInventoryMarketingAdviceOutput - The return type for the aiInventoryMarketingAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InventorySalesDataSchema = z.object({
  date: z.string().describe('The date of the sale in YYYY-MM-DD format.'),
  quantitySold: z.number().int().positive().describe('The quantity of the product sold on this date.'),
});

const InventoryItemSchema = z.object({
  id: z.string().describe('Unique identifier for the product.'),
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product (e.g., beverages, snacks, toiletries).'),
  buyPrice: z.number().positive().describe('The cost price of the product for the store.'),
  sellPrice: z.number().positive().describe('The selling price of the product to customers.'),
  stockQuantity: z.number().int().min(0).describe('The current quantity of the product in stock.'),
  salesHistory: z.array(InventorySalesDataSchema).optional().describe('Historical sales data for the product.'),
});

const AiInventoryMarketingAdviceInputSchema = z.object({
  inventoryItems: z.array(InventoryItemSchema).describe('A list of all products in the store inventory with their sales history.'),
});
export type AiInventoryMarketingAdviceInput = z.infer<typeof AiInventoryMarketingAdviceInputSchema>;

const AiInventoryMarketingAdviceOutputSchema = z.string().describe('Actionable advice on inventory optimization and basic marketing strategies.');
export type AiInventoryMarketingAdviceOutput = z.infer<typeof AiInventoryMarketingAdviceOutputSchema>;

export async function aiInventoryMarketingAdvice(input: AiInventoryMarketingAdviceInput): Promise<AiInventoryMarketingAdviceOutput> {
  return aiInventoryMarketingAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryMarketingAdvicePrompt',
  input: {schema: AiInventoryMarketingAdviceInputSchema},
  output: {schema: AiInventoryMarketingAdviceOutputSchema},
  prompt: `You are an expert retail advisor for a small sari-sari store. Your goal is to help the store owner improve sales and reduce waste by analyzing their inventory and sales data.

Analyze the provided inventory data and sales history to offer actionable advice on inventory optimization and marketing strategies. Focus on the following:

1.  **Identify Slow-Moving Items**: List items that have low sales velocity or high stock levels relative to demand. For each, suggest strategies to clear stock (e.g., promotions, bundling).
2.  **Suggest Cross-Selling Opportunities**: Based on product categories and sales history, identify items that are often bought together or could be bundled for increased sales.
3.  **Recommend Optimal Reorder Points**: For popular items, suggest when to reorder and ideal stock levels to avoid stockouts while minimizing holding costs.
4.  **Provide Basic Marketing Strategies**: Offer simple, actionable marketing advice to improve sales for specific products or the store overall (e.g., display tips, seasonal promotions, customer loyalty ideas).

Present your advice clearly and concisely, prioritizing the most impactful suggestions first. Use bullet points or numbered lists where appropriate for readability.

Inventory Data:
{{{json inventoryItems}}}`,
});

const aiInventoryMarketingAdviceFlow = ai.defineFlow(
  {
    name: 'aiInventoryMarketingAdviceFlow',
    inputSchema: AiInventoryMarketingAdviceInputSchema,
    outputSchema: AiInventoryMarketingAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
