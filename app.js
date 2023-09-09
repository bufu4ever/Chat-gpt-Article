const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs'); 
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OpenAIApi
});

const openai = new OpenAIApi(configuration);

// הגדרת פונקיצה ליצירת מאמר
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
    
    // הגדרת המשך כדי להמשיך את יצירת המאמר
    prompt = "Continue...";
  }

  totalText = topicPrompt + '\n\n' + totalText;
  console.log("Generated completion:", totalText);

  // המר את ה-topicPrompt לשם קובץ
  const filename = `${topicPrompt.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;

  // שמירת הקובץ בשם המאמר 
  fs.writeFile(filename, totalText, (err) => {
    if (err) {
      console.error("An error occurred while saving the file:", err);
    } else {
      console.log(`Article successfully saved to '${filename}'`);
    }
  });
  return totalText;
}

// בחירת כמות מילים ונושא המאמר
const desiredWordCount = 1000;
const topicPrompt = "article about building and maintaining websites";  // Change this prompt for different topics
generateArticle(desiredWordCount, topicPrompt);
