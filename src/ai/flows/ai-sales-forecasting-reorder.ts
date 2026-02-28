'use server';
/**
 * @fileOverview An AI agent for sales forecasting, reorder point suggestions, and marketing advice.
 *
 * - aiSalesForecastingReorder - A function that handles sales forecasting and reorder point suggestions.
 * - AiSalesForecastingReorderInput - The input type for the aiSalesForecastingReorder function.
 * - AiSalesForecastingReorderOutput - The return type for the aiSalesForecastingReorder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSalesForecastingReorderInputSchema = z.object({
  productDetails: z.array(
    z.object({
      productId: z.string().describe('Unique identifier for the product.'),
      productName: z.string().describe('Name of the product.'),
      category: z.string().describe('Category of the product (e.g., beverages, snacks, toiletries).'),
      buyPrice: z.number().describe('The cost price of the product.'),
      sellPrice: z.number().describe('The selling price of the product.'),
    })
  ).describe('Details of all products available in the store.'),
  historicalSalesData: z.array(
    z.object({
      productId: z.string().describe('Unique identifier of the product sold.'),
      quantitySold: z.number().int().positive().describe('Quantity of the product sold in this transaction.'),
      saleDate: z.string().datetime().describe('Date and time of the sale in ISO 8601 format.'),
    })
  ).describe('Historical sales data for all products over a period.'),
  currentStockLevels: z.array(
    z.object({
      productId: z.string().describe('Unique identifier of the product.'),
      stockQuantity: z.number().int().min(0).describe('Current quantity of the product in stock.'),
    })
  ).describe('Current stock levels for all products.'),
});
export type AiSalesForecastingReorderInput = z.infer<typeof AiSalesForecastingReorderInputSchema>;

const AiSalesForecastingReorderOutputSchema = z.object({
  forecasts: z.array(
    z.object({
      productId: z.string().describe('Unique identifier for the product.'),
      productName: z.string().describe('Name of the product.'),
      predictedDemand: z.number().int().min(0).describe('Predicted demand for the product over the next month.'),
      suggestedReorderPoint: z.number().int().min(0).describe('The stock level at which this product should be reordered.'),
      suggestedReorderQuantity: z.number().int().min(0).describe('The optimal quantity to reorder when the stock hits the reorder point.'),
      marketingAdvice: z.string().describe('Basic marketing advice or inventory optimization tips for this product.'),
    })
  ).describe('Sales forecasts, reorder suggestions, and marketing advice for each product.'),
  generalInsights: z.string().optional().describe('General insights or trends observed from the sales data.'),
});
export type AiSalesForecastingReorderOutput = z.infer<typeof AiSalesForecastingReorderOutputSchema>;

export async function aiSalesForecastingReorder(input: AiSalesForecastingReorderInput): Promise<AiSalesForecastingReorderOutput> {
  return aiSalesForecastingReorderFlow(input);
}

const aiSalesForecastingReorderPrompt = ai.definePrompt({
  name: 'aiSalesForecastingReorderPrompt',
  input: {schema: AiSalesForecastingReorderInputSchema},
  output: {schema: AiSalesForecastingReorderOutputSchema},
  prompt: `You are an expert retail inventory manager and sales analyst for a sari-sari store. Your task is to analyze product data, historical sales, and current stock levels to provide sales forecasts, optimal reorder points, suggested reorder quantities, and marketing advice for each product.

Here is the product information:
{{#each productDetails}}
- Product ID: {{{productId}}}
  Name: {{{productName}}}
  Category: {{{category}}}
  Buy Price: {{{buyPrice}}}
  Sell Price: {{{sellPrice}}}
{{/each}}

Here is the historical sales data:
{{#each historicalSalesData}}
- Product ID: {{{productId}}}
  Quantity Sold: {{{quantitySold}}}
  Sale Date: {{{saleDate}}}
{{/each}}

Here are the current stock levels:
{{#each currentStockLevels}}
- Product ID: {{{productId}}}
  Current Stock: {{{stockQuantity}}}
{{/each}}

Based on the provided data, for each product, predict the demand for the next month, suggest an optimal reorder point and quantity to avoid stockouts while minimizing excess inventory, and provide a short, actionable marketing or inventory optimization advice. Also provide any general insights or trends you observe from the data.

Your output should be a JSON object conforming to the following schema:
`,
});

const aiSalesForecastingReorderFlow = ai.defineFlow(
  {
    name: 'aiSalesForecastingReorderFlow',
    inputSchema: AiSalesForecastingReorderInputSchema,
    outputSchema: AiSalesForecastingReorderOutputSchema,
  },
  async input => {
    const {output} = await aiSalesForecastingReorderPrompt(input);
    return output!;
  }
);
