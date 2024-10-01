function createChatbotUI() {
    const chatbotContainer = document.getElementById("chatbot-container");

    // Chatbot Button
    const chatbotBtn = document.createElement("button");
    chatbotBtn.id = "chatbotBtn";
    chatbotBtn.className = "fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 focus:outline-none";
    chatbotBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19c4.418 0 8-3.582 8-8S16.418 3 12 3 4 6.582 4 11c0 1.14.226 2.227.636 3.226a19.45 19.45 0 00-2.128 3.796 0.75.75 0 00.7 1.028c1.578.063 3.046-.315 4.45-.906C8.973 18.58 10.452 19 12 19z"/>
        </svg>
    `;
    chatbotContainer.appendChild(chatbotBtn);

    // Chatbot Window
    const chatbotWindow = document.createElement("div");
    chatbotWindow.id = "chatbotWindow";
    chatbotWindow.className = "hidden fixed bottom-5 right-5 w-80 max-w-full h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col";
    chatbotContainer.appendChild(chatbotWindow);

    // Chatbot Header
    const chatbotHeader = document.createElement("div");
    chatbotHeader.className = "bg-green-500 text-white p-3 flex justify-between items-center rounded-t-lg";
    chatbotHeader.innerHTML = `
        <span class="font-semibold">বাংলা বট</span>
        <button id="closeChatbot" class="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;
    chatbotWindow.appendChild(chatbotHeader);

    // Chatbot Body
    const chatbotBody = document.createElement("div");
    chatbotBody.id = "chatbotBody";
    chatbotBody.className = "flex-1 p-3 overflow-y-auto";
    chatbotWindow.appendChild(chatbotBody);

    // Chatbot Footer
    const chatbotFooter = document.createElement("div");
    chatbotFooter.className = "p-3 bg-gray-100 rounded-b-lg flex";
    chatbotWindow.appendChild(chatbotFooter);

    const userInput = document.createElement("input");
    userInput.type = "text";
    userInput.id = "userInput";
    userInput.placeholder = "Type your message...";
    userInput.className = "flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500";
    chatbotFooter.appendChild(userInput);

    const sendBtn = document.createElement("button");
    sendBtn.id = "sendBtn";
    sendBtn.textContent = "Send";
    sendBtn.className = "bg-green-500 text-white px-4 py-2 rounded-r-md hover:bg-green-600 focus:outline-none";
    chatbotFooter.appendChild(sendBtn);

    // Event Listeners
    chatbotBtn.onclick = function () {
        chatbotWindow.classList.remove("hidden");
        chatbotBtn.classList.add("hidden");
    };

    document.getElementById("closeChatbot").onclick = function () {
        chatbotWindow.classList.add("hidden");
        chatbotBtn.classList.remove("hidden");
    };

    sendBtn.onclick = sendMessage;
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
}

// Function to send user input to the Flask API and get a response
//<img src="profile-user.png" alt="User Avatar" class="avatar">
function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();

    if (userInput !== "") {
        // Add user message
        const userMessageElement = document.createElement("div");
        userMessageElement.className = "message user";
        userMessageElement.innerHTML = `
            
            <div class="message-content">${userInput}</div>
        `;
        document.getElementById("chatbotBody").appendChild(userMessageElement);

        document.getElementById("userInput").value = "";

        fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_input: userInput }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Add bot message
                const botMessageElement = document.createElement("div");
                botMessageElement.className = "message bot";
                botMessageElement.innerHTML = `
                    <img src="chatbot.png" alt="Bot Avatar" class="avatar">
                    <div class="message-content">${data.response}</div>
                `;
                document.getElementById("chatbotBody").appendChild(botMessageElement);

                document.getElementById("chatbotBody").scrollTop =
                    document.getElementById("chatbotBody").scrollHeight;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
}

// Initialize the chatbot after the page has fully loaded
window.onload = createChatbotUI;
