document.addEventListener('DOMContentLoaded', () => {

    // Constants
    const CONTEXT_DEFAULT_TEXT = "You are a financial advisor who wants to provide a current and well written newsletter introduction message each week. You know that a well written newsletter intro message is maximum 1 to 2 paragraphs long, will have a general theme of financial wellness. Keep it simple and straight forward. Briefly mention having the need for a good financial plan and invite the client to book a meeting.";
    const CONTEXT_MESSAGE_TEXT = "Write a newsletter introduction message. Provide a subject line followed by a message. The introduction should be concise, around 700 characters or roughly two paragraphs. Exclude greetings and signatures. Do not invent events or details.";

    // Variables
    let selectedArticles = {};
    let retrievedContent = null;
    let data = "";

    // Initialize default input values
    document.getElementById('contextInput').value = CONTEXT_DEFAULT_TEXT;
    document.getElementById('messageInput').value = CONTEXT_MESSAGE_TEXT;

    // Event Listeners
    document.getElementById('generateBtn').addEventListener('click', generateIntroduction);
    document.getElementById('content-tab').addEventListener('click', function () {
        retrieveContent();
        resetViewToggle();
    });

    document.getElementById('listViewBtn').addEventListener('click', toggleListView);
    document.getElementById('tileViewBtn').addEventListener('click', toggleTileView);
    document.getElementById('newsletterText').addEventListener('input', updateCharCount);
    document.addEventListener('change', handleCheckboxChange);

    // Listen for changes to checkboxes and update the selectedArticles object
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('article-checkbox')) {
            const articleIndex = e.target.getAttribute('data-article-index');
            selectedArticles[articleIndex] = e.target.checked;
        }
    });

    document.getElementById('listViewBtn').addEventListener('click', function () {
        if (retrievedContent) {
            this.classList.add('active');
            document.getElementById('tileViewBtn').classList.remove('active');
            displayContent(retrievedContent, 'list');
            restoreSelections();
        }
    });

    document.getElementById('tileViewBtn').addEventListener('click', function () {
        if (retrievedContent) {
            this.classList.add('active');
            document.getElementById('listViewBtn').classList.remove('active');
            displayContent(retrievedContent, 'tile');
            restoreSelections();
        }
    });



    // Attach an event listener to the contentDisplay for checkbox changes.
    document.getElementById('contentDisplay').addEventListener('change', function (e) {
        // Check if the changed element is an article checkbox
        if (e.target.classList.contains('article-checkbox')) {
            const checkbox = e.target;
            const cardSelected = checkbox.closest('.card-selected');

            if (cardSelected) {
                if (checkbox.checked) {
                    cardSelected.classList.add('card-checked');
                } else {
                    cardSelected.classList.remove('card-checked');
                }
            }
        }
    });

    // Add event listener to the clearCheckboxesBtn to uncheck all checkboxes when clicked.
    document.getElementById('clearCheckboxesBtn').addEventListener('click', function () {
        // Clear the selectedArticles object (assuming you still need this).
        selectedArticles = {};

        // Re-query the DOM for checkboxes since new ones might have been added.
        const checkboxes = document.querySelectorAll('.article-checkbox');

        // Uncheck all checkboxes.
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;

            // Remove the 'card-checked' class from all cards.
            const cardSelected = checkbox.closest('.card-selected');
            if (cardSelected) {
                cardSelected.classList.remove('card-checked');
            }
        });

        updateSelectionCount();


    });




    // Functions
    function resetViewToggle() {
        const listViewBtn = document.getElementById('listViewBtn');
        const tileViewBtn = document.getElementById('tileViewBtn');

        listViewBtn.classList.add('active');
        tileViewBtn.classList.remove('active');
    }



    function updateSelectionCount() {
        const checkedBoxes = document.querySelectorAll('.article-checkbox:checked').length;
        const displayElement = document.getElementById('selectionCount');

        if (checkedBoxes === 0) {
            displayElement.style.display = 'none'; // Hide the display if no checkboxes are selected
        } else {
            const displayText = checkedBoxes === 1 ? 'Selected' : 'Selected';
            displayElement.textContent = `${checkedBoxes} ${displayText}`;
            displayElement.style.display = 'inline'; // Show the display if at least one checkbox is selected
        }
    }

    updateSelectionCount()




    async function generateIntroduction() {
        // Retrieve the selected tone and keywords
        const selectedTone = document.getElementById('toneSelect').value;
        const keywords = document.getElementById('keywordsInput').value;
        const eventValue = document.getElementById('eventSelect').value;
        const selectedMood = document.getElementById('selectedMood').value;


        // Construct keyword and event phrases
        let keywordPhrase = keywords.trim() !== "" ? `Suggested Themes: ${keywords}.` : "";
        const eventPhrase = eventValue.trim() !== "" ? `Related Event: ${eventValue}.` : "";
        const moodPhrase = selectedMood.trim() !== "" ? `Mood: ${selectedMood}.` : "";



        // Construct article references
        const selectedArticleCheckboxes = document.querySelectorAll('.article-checkbox:checked');
        selectedArticleCheckboxes.forEach((checkbox) => {
            const articleIndex = parseInt(checkbox.getAttribute('data-article-index'), 10);
            const articleDetails = data.available_shares[articleIndex];
            if (articleDetails) {
                keywordPhrase += ` Consider referencing the article titled "${articleDetails.article.headline}" with summary: ${articleDetails.article.summary} .`;
            }
        });

        // Construct context and message
        const context = `${document.getElementById('contextInput').value}${selectedTone}`;
        let message = `${document.getElementById('messageInput').value}${keywordPhrase}${eventPhrase}${moodPhrase}`;


        // Add references if checkbox is checked
        const includeReference = document.getElementById('includeContentReference').checked;
        if (includeReference && retrievedContent && retrievedContent.available_shares) {
            for (let item of retrievedContent.available_shares) {
                const article = item.article;
                message += ` You may also reference this article Title: ${article.headline} and summary: ${article.summary}.`;
            }
        }

        // Define the request payload
        const payload = {
            context: context,
            message: message
        };

        // Show the spinner before sending the request
        document.getElementById('loadingSpinner').classList.remove('d-none');

        // Constants for server details
        const SERVER_URL = "https://newsletterai.onrender.com";

        try {
            // Send a POST request to the server
            const response = await fetch(`${SERVER_URL}/chatGPT`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Parse the response
            const data = await response.json();

            // Update the textarea with the AI-generated introduction
            if (data && data.message && data.message.length > 0) {
                const aiResponse = data.message[data.message.length - 1];
                const newsletterTextArea = document.getElementById('newsletterText');
                newsletterTextArea.value = aiResponse.content;

                // Adjust the height of the textarea based on its content
                newsletterTextArea.style.height = 'auto'; // Reset height
                newsletterTextArea.style.height = (newsletterTextArea.scrollHeight) + 'px';

                // Update character count
                updateCharCount();

                // Hide the spinner after receiving the response
                document.getElementById('loadingSpinner').classList.add('d-none');
            } else {
                console.error('Error retrieving AI-generated introduction.');
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('loadingSpinner').classList.add('d-none');
        }
    }


    function updateCharCount() {
        const textArea = document.getElementById('newsletterText');
        const charCount = textArea.value.length;
        const charCountDisplay = document.getElementById('charCount');

        charCountDisplay.textContent = `${charCount} characters`;
    }


    function handleCheckboxChange(e) {
        if (e.target.classList.contains('article-checkbox')) {
            const articleIndex = e.target.getAttribute('data-article-index');
            selectedArticles[articleIndex] = e.target.checked;
        }
        updateSelectionCount();
    }

    function restoreSelections() {
        for (let articleIndex in selectedArticles) {
            const checkbox = document.querySelector(`.article-checkbox[data-article-index="${articleIndex}"]`);
            if (checkbox) {
                checkbox.checked = selectedArticles[articleIndex];

                const cardSelected = checkbox.closest('.card-selected');
                if (cardSelected) {
                    if (checkbox.checked) {
                        cardSelected.classList.add('card-checked');
                    } else {
                        cardSelected.classList.remove('card-checked');
                    }
                }
            }
        }
    }



    async function retrieveContent() {
        const FEED_URL = 'https://my.advisorstream.com/communication/advisorwebsite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwayI6MjAwMTZ9.BjNMoEKzNbr8OR2_-S3boXpRofO-myHeO6VyY3hzEuw';

        try {
            const response = await fetch(FEED_URL);

            if (!response.ok) {
                throw new Error('Network response was not ok - SM5');
            }

            data = await response.json();
            displayContent(data);
            retrievedContent = data;
            restoreSelections();
        } catch (error) {
            console.error('There was a problem with the fetch operation (SM6):', error.message);
        }
    }




    // Function to highlight recommended articles based on keywords
    function highlightRecommendedArticles() {
        // Get the keywords from the input field
        const keywordsInput = document.getElementById("keywordsInput").value;
        const keywords = keywordsInput.split(',').map(keyword => keyword.trim().toLowerCase());

        // Check if there are no keywords or if the input field is empty
        if (keywords.length === 0 || !keywordsInput.trim()) {
            return; // Exit the function early
        }

        // Get all articles (targeting both list and tile views)
        const articles = document.querySelectorAll('.content-item, .custom-card');

        articles.forEach(article => {
            // Identify the container for the recommendation
            const recommendationContainer = article.querySelector('.keyword-recommendation-container');


            // Remove any existing recommendation label
            if (recommendationContainer) {
                const existingLabel = recommendationContainer.querySelector('.keyword-recommendation');
                if (existingLabel) {
                    existingLabel.remove();
                }
            }

            // Check the title and summary of the article for keyword matches
            const title = article.querySelector('h5').textContent.toLowerCase();
            const summary = article.querySelector('p').textContent.toLowerCase();

            let matchFound = false; // Flag to check if a match is found

            for (let keyword of keywords) {
                if (title.includes(keyword) || summary.includes(keyword)) {
                    matchFound = true;
                }
            }

            if (matchFound && recommendationContainer) {
                // If a match is found, add the "Keyword Recommendation" label
                const label = document.createElement('span');
                label.className = 'keyword-recommendation';

                // Create the ion-icon element
                const icon = document.createElement('ion-icon');
                icon.setAttribute('name', 'ribbon');
                icon.style.fontSize = '26px';
                label.appendChild(icon);  // Append the icon to the label

                // Add data attributes for Bootstrap tooltip
                label.setAttribute('data-bs-toggle', 'tooltip');
                label.setAttribute('data-bs-placement', 'top');
                label.setAttribute('title', 'This article is recommended based on your keywords.');

                recommendationContainer.appendChild(label); // Append the label to the recommendation container

                // Initialize the Bootstrap tooltip
                new bootstrap.Tooltip(label);

                // Show the label since there's a match
                label.style.display = 'block';
            }
        });
    }


    function highlightClientConsumptionRecommendations() {
        const tagsInput = document.getElementById("clientConsumptionTagsInput").value;
        const tags = tagsInput.split(',').map(tag => tag.trim().toLowerCase());

        if (tags.length === 0 || !tagsInput.trim()) {
            return;
        }


        // Display parsed tags as labels
        const tagsDisplayContainer = document.getElementById('tagsDisplayContainer');
        tagsDisplayContainer.innerHTML = ''; // Clear previous tags

        tags.forEach(tag => {
            if (tag) {
                const tagLabel = document.createElement('span');
                tagLabel.className = 'badge bg-secondary me-2'; // Using Bootstrap badge for styling
                tagLabel.textContent = tag;
                tagsDisplayContainer.appendChild(tagLabel);
            }
        });



        const articles = document.querySelectorAll('.content-item, .custom-card');

        articles.forEach(article => {
            const recommendationContainer = article.querySelector('.client-consumption-recommendation-container');

            if (recommendationContainer) {
                const existingLabel = recommendationContainer.querySelector('.client-consumption-recommendation');
                if (existingLabel) {
                    existingLabel.remove();
                }
            }

            const title = article.querySelector('h5').textContent.toLowerCase();
            const summary = article.querySelector('p').textContent.toLowerCase();

            let matchFound = false;

            for (let tag of tags) {
                if (title.includes(tag) || summary.includes(tag)) {
                    matchFound = true;
                }
            }

            if (matchFound && recommendationContainer) {
                const label = document.createElement('span');
                label.className = 'client-consumption-recommendation';

                const icon = document.createElement('ion-icon');
                icon.setAttribute('name', 'ribbon');  // You can change the icon if needed
                icon.style.fontSize = '26px';
                label.appendChild(icon);

                label.setAttribute('data-bs-toggle', 'tooltip');
                label.setAttribute('data-bs-placement', 'top');
                label.setAttribute('title', 'This recommendation uses the AdvisorStream "Client Consumption Model"  to suggest content similiar to what your contacts are reading most.');

                recommendationContainer.appendChild(label);
                new bootstrap.Tooltip(label);
                label.style.display = 'block';
            }
        });
    }

    document.getElementById('clientConsumptionTagsInput').addEventListener('input', highlightClientConsumptionRecommendations);




    function toggleListView() {
        if (retrievedContent) {
            displayContent(retrievedContent, 'list');
            restoreSelections(); // Restore checkbox states and apply card-checked class
            highlightRecommendedArticles();
            highlightClientConsumptionRecommendations()
        }
        this.classList.add('active');
        document.getElementById('tileViewBtn').classList.remove('active');
    }

    function toggleTileView() {
        if (retrievedContent) {
            displayContent(retrievedContent, 'tile');
            restoreSelections(); // Restore checkbox states and apply card-checked class
            highlightRecommendedArticles();
            highlightClientConsumptionRecommendations()
        }
        this.classList.add('active');
        document.getElementById('listViewBtn').classList.remove('active');
    }



    // Add an event listener to the keywords input field to call the function whenever its value changes
    document.getElementById('keywordsInput').addEventListener('input', highlightRecommendedArticles);




    function displayContent(data, viewType) {
        let contentHtml = '';

        if (viewType === 'tile') {
            contentHtml = createTileView(data);
        } else {
            contentHtml = createListView(data);
        }

        const contentDisplayElement = document.getElementById('contentDisplay');
        if (contentDisplayElement) {
            contentDisplayElement.innerHTML = contentHtml;
        }
        highlightRecommendedArticles();
        highlightClientConsumptionRecommendations()
    }

    function createTileView(data) {
        let html = '<div class="row">';

        data.available_shares.forEach((item, index) => {
            const article = item.article;
            html += `
            <div class="col-md-6 mb-4 ">
            <div class="card custom-card card-selected">
                <div class="card-img-container" style="background-image: url('${article.image_url}');"></div>
                <div class="card-body d-flex flex-column card-highlight">
                    <h5 class="card-title">${article.headline}</h5>
                    <p class="card-text">${article.summary}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center card-footer tile-card-footer">
                <div class="d-flex">
                <a href="${item.page_url}" target="_blank"><ion-icon name="reader-outline" style="font-size: 26px;"></ion-icon></a>
                <span class="client-consumption-recommendation-container"></span>
                <span class="keyword-recommendation-container ml-2"></span>
                </div>

                <div class="d-flex align-items-center">
                    <label class="form-check-label include-checkbox-label mr-2" for="checkbox${index}">Include</label>
                    <input class="form-check-input article-checkbox" type="checkbox" data-article-index="${index}" id="checkbox${index}">
                </div>
            </div>

            </div>
        </div>
            `;
        });

        return html + '</div>';
    }

    function createListView(data) {
        let html = '';

        data.available_shares.forEach((item, index) => {
            const article = item.article;
            html += `
            <div class="row content-item card-selected">
    <!-- Image Column -->
    <div class="col-md-2 card-highlight">
        <div class="content-item-img" style="background-image: url('${article.image_url}');"></div>
    </div>

    <!-- Text Content Column -->
    <div class="col-md-7">
        <div class="row content-item-text-cutoff">
            <h5>${article.headline}</h5>
            <p>${article.summary}</p>
        </div>
        <div class="row">
            <span class="list-view-publisher">${article.source_display_name} | ${article.published_on_display}</span>
        </div>
    </div>

    <!-- ReadMore, Recommendation, and Checkbox Column -->
    <div class="col-md-3 col-recs">
        <div class="row">
            <!-- First row for ReadMore icon and recommendation -->
            <div class="col-12 d-flex align-items-center justify-content-between">
                <span><a href="${item.page_url}" target="_blank"><ion-icon name="reader-outline" style="font-size: 26px;"></ion-icon></a></span>
                <span><label class="form-check-label include-checkbox-label mr-2" for="checkbox${index}">Include</label>
                <input class="form-check-input article-checkbox" type="checkbox" data-article-index="${index}" id="checkbox${index}"></span>

            </div>

            <!-- Second row for the checkbox -->
            <div class="col-12 d-flex align-items-center">
            <span class="client-consumption-recommendation-container"></span>
            <span class="keyword-recommendation-container ml-2"></span>


            </div>
        </div>
    </div>
</div>

            `;
        });

        return html;
    };




});
