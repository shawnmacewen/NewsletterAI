import supabase from './supabaseClient.js';

export async function fetchMessages() {
    const { data, error } = await supabase.from('messages').select('id, user_content');

    if (error) {
        console.error("Error fetching messages:", error);
        return;
    }

    return data;
}



export async function displayMessages() {
    const messages = await fetchMessages();

    const messagesList = document.getElementById("messagesList");

    // Clear existing list items
    messagesList.innerHTML = "";

    // Populate list with fetched messages
    messages.forEach(message => {
        const listItem = document.createElement("li");
        listItem.textContent = `${message.id}: ${message.user_content}`;
        messagesList.appendChild(listItem);
    });
}



export async function saveNewsletterTemplate(templateName, newsletterText) {
    const { data, error } = await supabase
        .from('newsletter_templates')
        .insert([
            { template_name: templateName, newsletter_intro: newsletterText }
        ]);

    if (error) {
        console.error("Error saving template:", error);
        return null;
    }

    return data;
}

export async function loadNewsletterTemplates() {
    const { data, error } = await supabase
        .from('newsletter_templates')
        .select('id, created_at, template_name, newsletter_intro');

    if (error) {
        console.error("Error fetching templates:", error);
        return [];
    }

    return data;
}





export async function deleteNewsletterTemplate(templateId) {
    const { error } = await supabase
        .from('newsletter_templates')
        .delete()
        .eq('id', templateId);

    if (error) {
        console.error("Error deleting template:", error);
        return false;
    }
    return true;
}


// ... other database related functions
