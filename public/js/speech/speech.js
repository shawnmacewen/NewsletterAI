import axios from 'axios';

// Function to call OpenAI Text-to-Speech API
export async function convertTextToSpeech(text) {
    const url = 'https://api.openai.com/v1/audio/speech'; // Replace with the actual endpoint for text-to-speech

    const response = await axios.post(url, {
        prompt: text,
        max_tokens: 100,
        n: 1,
        stop: null,
        temperature: 0.5
    }, {
        headers: {
            'Authorization': `${process.env.CHATGPT_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data.choices[0].text; // Adjust this to match the API response format
}