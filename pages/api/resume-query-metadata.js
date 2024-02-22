/**
 * This endpoint is used to load the resumes into the chain, then upload them to the Pinecone database.
 * Tutorial: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/directory
 * Summarization: https://js.langchain.com/docs/modules/chains/other_chains/summarization
 * Dependencies: npm install pdf-parse
 */

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

export default async function handler(req, res) {
  try {
    //    do stuff
    const { prompt } = req.body;

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    );

    //Jonny You Have to Work Over Here

    // Create Vector DBQA CHain
    const model = new OpenAI({ temperature: 0, openAIApiKey: process.env.OPENAI_API_KEY, modelName: "gpt-3.5-turbo"  });
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    });

    // Prompt Template
    const promptTemplate = new PromptTemplate({
      template: `Assume you are a Human Resources Director. According to the resumes, answer this question: {question}`,
      inputVariables: ["question"],
    });

    const formattedPrompt = await promptTemplate.format({
      question: prompt,
    });

    const response = await chain.call({
      query: formattedPrompt,
    });

    return res.status(200).json({
      output: response.text,
      sourceDocuments: response.sourceDocuments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error" });
  }
}
