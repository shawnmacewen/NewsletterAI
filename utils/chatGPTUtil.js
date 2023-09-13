// require packages and constants
require("dotenv").config();
const axios = require("axios");
const Yup = require("yup");


// Define contsans
const CHATGPT_END_POINT = "https://api.openai.com/v1/chat/completions";
const CHATGPT_MODEL = "gpt-3.5-turbo";

// setup config for axios request
const config = {
    headers: {
        Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
    },
};

//function to build conversation array
const buildConversation = (contextMessage, conversation) => {
    return [contextMessage].concat(conversation);
};


// function to post a message to the ChatGPT API
const postChatGPTMessage = async (contextMessage, conversation) => {
    const messages = buildConversation(contextMessage, conversation);
    const chatGPTData = {
        model: CHATGPT_MODEL,
        messages: messages,
    };


    try {
        const resp = await axios.post(CHATGPT_END_POINT, chatGPTData, config);
        const data = resp.data;
        console.log(resp.data)
        const message = data?.choices[0]?.message; // Get response message
        return message;
    }   catch (error) {
    console.error("Errior with ChatGPT API - SM4"); // log error message
    console.error(error);
    return null;
    }
};


const conversationSchema = Yup.object().shape({
    role: Yup.string().required("Role is required"),
    content: Yup.string().required("Content is required"),
});


// Define Yup validation schema for request boject
const requestSchema = Yup.object().shape({
    context: Yup.string().required(),
    message: Yup.string().required(),
    conversation: Yup.array().of(conversationSchema).notRequired(),   
});

// function to vaslidate request object using Yup Schema
const isValidRequest = (request) => {
    try {
        requestSchema.validateSync(request);
        return true;
    }   catch (error) {
        return false;
    }
};

// function to create a message 
const createMessage = (message, role) => {
    return {
        role: role,
        content: message,
    };
};

// function to add new message to conversation
const addMessageToConversation = (message, conversation, role) => {
    conversation.push(createMessage(message, role));
};



module.exports = {
    isValidRequest,
    postChatGPTMessage,
    addMessageToConversation,
    createMessage,


};