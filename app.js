const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs'); 
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OpenAIApi
});

const openai = new OpenAIApi(configuration);

// Define the function to generate an article
const generateArticle = async (desiredWordCount, topicPrompt) => {
  let totalText = "";
  let prompt = topicPrompt;
  const max_tokens_per_request = 3000;

  while (totalText.split(' ').length < desiredWordCount) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.1,
      max_tokens: max_tokens_per_request,
    });

    totalText += completion.data.choices[0].text;
    prompt = "Continue...";
  }

  totalText = topicPrompt + '\n\n' + totalText;

  // Add your translation code here
  const { TranslationServiceClient } = require('@google-cloud/translate');
  
  // Set as an environment variable instead
  process.env.GOOGLE_APPLICATION_CREDENTIALS = "C:\\Users\\sdrat\\Downloads\\chatgpt-398414-43e32f49d66f.json";

  const translationClient = new TranslationServiceClient();
  const projectId = 'chatgpt-398414';
  const location = 'global';

  async function translateText() {
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [totalText],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode: 'he',
    };

    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
      console.log(`Translation: ${translation.translatedText}`);
      saveTranslatedTextToFile(topicPrompt, translation.translatedText);
    }
  }
  
  await translateText();
};

// Function to save translated text to a file
const saveTranslatedTextToFile = (topicPrompt, translatedText) => {
  const filename = `${topicPrompt.replace(/[^a-zA-Z0-9]/g, '_')}_translated.txt`;

  fs.writeFile(filename, translatedText, (err) => {
    if (err) {
      console.error("An error occurred while saving the file:", err);
    } else {
      console.log(`Translated article successfully saved to '${filename}'`);
    }
  });
};

const desiredWordCount = 1000;
const topicPrompt = "Buying a new laptop";
generateArticle(desiredWordCount, topicPrompt);
