document.addEventListener('DOMContentLoaded', () => {
    // Your JavaScript code here

    const CONTEXT_DEFAULT_TEXT = "You are a financial advisor who wants to provide a current and well written newsletter introduction message each week. You know that a well written newsletter intro message is maximum 1 to 2 paragraphs long, will have a general theme of finanacial wellness. Keep it simple and straight forward. Briefly mention having the need for a good financial plan and invite the client to book a meeting.";
    const CONTEXT_MESSAGE_TEXT = "Write a newsletter introduction message. Provide  subject line followed by a message. The introduction should be concise, around 700 characters or roughly two paragraphs. Exclude greetings and signatures. Do not invent events or details.";


    document.getElementById('contextInput').value = CONTEXT_DEFAULT_TEXT;
    document.getElementById('messageInput').value = CONTEXT_MESSAGE_TEXT;



    document.getElementById('generateBtn').addEventListener('click', generateIntroduction);

    async function generateIntroduction() {

        // Retrieve the selected tone
        const selectedTone = document.getElementById('toneSelect').value;

        // Retrieve the keywords
        const keywords = document.getElementById('keywordsInput').value;
        const keywordPhrase = keywords.trim() !== "" ? ` The intro should also consider these themes to reference: ${keywords}.` : "";

        // retrieve the events
        const eventValue = document.getElementById('eventSelect').value;
        const eventPhrase = eventValue.trim() !== "" ? `The event ${eventValue} is also relevant.` : "";

        // Get values from the input boxes
        const context = document.getElementById('contextInput').value + document.getElementById('toneSelect').value;
        let message = document.getElementById('messageInput').value + keywordPhrase + eventPhrase;


        // Check if the "Include Content Reference" checkbox is checked
        const includeReference = document.getElementById('includeContentReference').checked;
        if (includeReference && retrievedContent && retrievedContent.available_shares) {
         for (let item of retrievedContent.available_shares) {
        const article = item.article;
        message += ` You may also reference this article Title: ${article.headline} and summary: ${article.summary}.`;
         }
        }



        // Do the variable gathering before this next step
        // Define the request payload
        const payload = {
            context: context,
            message: message
        };
    

        
    // Show the spinner before sending the request
    document.getElementById('loadingSpinner').classList.remove('d-none');

    const SERVER_URL = "https://newsletterai.onrender.com";  // Update this to your actual server address
    const SERVER_LOCAL = 'http://127.0.0.1';
    const SERVER_PORT = 3000; // port
    const FILECHECK = 9;

        try {
            // Send a POST request to the server
            console.log(`filecheck: ${FILECHECK}`)
            console.log("Attempting to conntent to APP GPT API - SM8")
            console.log(`Server is currently set as ${SERVER_URL}`)

            const response = await fetch(`${SERVER_URL}/chatGPT`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
         
            console.log("Erorr is after the post request")
            // Parse the response
            const data = await response.json();
            
            // Update the textarea with the AI-generated introduction
            if (data && data.message && data.message.length > 0) {
                const aiResponse = data.message[data.message.length - 1];
                document.getElementById('newsletterText').value = aiResponse.content;
                
        // Hide the spinner after receiving the response
        document.getElementById('loadingSpinner').classList.add('d-none');
            } else {
                console.error('Error retrieving AI-generated introduction.');
            }
        } catch (error) {
            console.error('Error:', error);
            
        // Hide the spinner after receiving the response
        document.getElementById('loadingSpinner').classList.add('d-none');
        }
    };
    

// Character counter that is half assed
    document.getElementById('newsletterText').addEventListener('input', updateCharCount);

    function updateCharCount() {
    const textArea = document.getElementById('newsletterText');
    const charCountDisplay = document.getElementById('charCount');
    const charCount = textArea.value.length;

    charCountDisplay.textContent = `${charCount} characters`;
};


// Get AdvisorStream content feed from website Snippet. 
document.getElementById('retrieveContentBtn').addEventListener('click', retrieveContent);

let retrievedContent = null; 

async function retrieveContent() {
    try {
        const response = await fetch('https://my.advisorstream.com/communication/advisorwebsite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwayI6MjAwMTZ9.BjNMoEKzNbr8OR2_-S3boXpRofO-myHeO6VyY3hzEuw');
        if (!response.ok) {
            throw new Error('Network response was not ok - SM5');
        }
        data = await response.json();
        displayContent(data);
        retrievedContent = data;
        console.log(retrievedContent);
    } catch (error) {
        console.error('There was a problem with the fetch operation (SM6):', error.message);
    }
};

function displayContent(data) {
    let contentHtml = '<div class="row">';  // Start a new row

    for (let item of data.available_shares) {
        const article = item.article;
        contentHtml += `
            <div class="col-md-6 mb-4">
                <div class="card custom-card">
                    <div class="card-img-container" style="background-image: url('${article.image_url}');"></div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${article.headline}</h5>
                        <p class="card-text">${article.summary}</p>
                        <a href="${item.page_url}" class="read-more-link" target="_blank">Read More</a>
                    </div>
                </div>
            </div>
        `;
    }

    contentHtml += '</div>';  // Close the row
    document.getElementById('contentDisplay').innerHTML = contentHtml;
};


updateCharCount();


});

