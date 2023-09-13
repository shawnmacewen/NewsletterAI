const express = require("express");
const { 
    isValidRequest, 
    createMessage, 
    postChatGPTMessage,
    addMessageToConversation } = require("../utils/chatGPTUtil");
const { USER_TYPES } = require("../constants/chatGPTRoles");



// Create new router instance of application
const router = express.Router();

// create a new post
router.post("/", async (req, res) => {
    console.log(req.body); 

// Validate request body
if (!isValidRequest(req.body)) {
    return res.status(400).json({ error: "Invalid Request - SM3"});
}

// Extract the message and conversation from the request body
const { message, context, conversation = [] } = req.body;

// create context message
const contextMessage = createMessage(context, USER_TYPES.SYSTEM);

// add message to conversation
addMessageToConversation(message, conversation, USER_TYPES.USER)

// Call postChatGPTMessage to get response from ChatGPT API
const chatGPTResponse = await postChatGPTMessage(
    contextMessage,
    conversation
);

// check if an error with ChatGPT API
if (!chatGPTResponse) {
    return res.status(500).json({ error: "Error with ChatGPT - SM4"});
}

// get content from ChatGPT response
const { content } = chatGPTResponse;

// Add the ChatGPT response to the conversation
addMessageToConversation(content, conversation, USER_TYPES.ASSISTANT);




// return the conversation as a JSNO Response
console.log("Updated conversation:\n", conversation);
return res.status(200).json({ message: conversation});

});

module.exports = router;