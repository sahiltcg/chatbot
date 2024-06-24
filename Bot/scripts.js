document.addEventListener('DOMContentLoaded', () => {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbot = document.getElementById('chatbot');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesContainer = document.getElementById('chat-content');
    const chatbotIcon = document.getElementById('chatbot-icon');
    const botIconContainer = document.querySelector('.bot-icon-container');
    const botName = document.querySelector('.bot-name');
    const header = document.getElementById('chatbox-header');
    const generateButton = document.getElementById('generate-button');
    let isInitialMessageSent = false;
    let isSendingMessage = false;
    let isChatbotButtonDisabled = false;
    let useGPT4 = true; // Flag to toggle between GPT-4 and DALL-E 3

    const SERVER_API_URL = 'http://localhost:3000/api/chat'; // Update with your server URL

    const toggleChatbot = () => {
        const isOpen = chatbot.style.display === 'none' || chatbot.style.display === '';
        isOpen ? openChatbot() : closeChatbot();
    };

    const openChatbot = () => {
        chatbot.style.display = 'flex';
        chatbot.style.animation = 'chatbox-open 0.9s forwards';
        chatbotButton.style.animation = 'rotate-button-open 0.5s forwards';
        chatbotIcon.style.animation = 'rotate-image-open 0.4s forwards';
        chatbotIcon.src = 'images/end-chat-icon.png';
        chatbotIcon.classList.add('end-chat-icon');
        header.style.display = 'none';
        setTimeout(() => {
            header.style.display = 'flex';
            header.style.animation = 'header-popup 0.4s forwards';
        }, 200);
        botIconContainer.style.visibility = 'hidden';
        botName.style.opacity = 0;
        setTimeout(() => {
            botIconContainer.style.visibility = 'visible';
            botIconContainer.style.animation = 'bot-icon-visibility 0.3s forwards, bot-icon-popup 0.4s forwards';
            botName.style.animation = 'bot-name-visibility 0.4s forwards';
        }, 600);
        if (!isInitialMessageSent) {
            isInitialMessageSent = true;
            setTimeout(() => addBotMessage('Hi, Welcome.'), 500);
        }
    };

    const closeChatbot = () => {
        chatbot.style.animation = 'chatbox-close 0.4s forwards';
        chatbotButton.style.animation = 'rotate-button-close 0.3s forwards';
        chatbotIcon.style.animation = 'rotate-image-close 0.3s forwards';
        chatbotIcon.src = 'images/chat-icon.png';
        chatbotIcon.classList.remove('end-chat-icon');
        setTimeout(() => {
            chatbot.style.display = 'none';
        }, 400);
    };

    const sendMessage = () => {
        if (isSendingMessage) return;
        const userMessage = userInput.value.trim();
        if (userMessage) {
            addMessage(userMessage, 'user-message');
            userInput.value = '';
            isSendingMessage = true;
            sendButton.disabled = true;
            getChatGPTResponse(userMessage);
        }
        resetInputHeight();
    };

    const getChatGPTResponse = async (message) => {
        try {
            const response = await fetch(SERVER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, useGPT4 })
            });
            const data = await response.json();

            if (useGPT4) {
                addBotMessage(data.botMessage);
            } else {
                // Display the image from the URL returned
                addImageMessage(data.botMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            addBotMessage('Sorry, something went wrong.');
        } finally {
            isSendingMessage = false;
            sendButton.disabled = false;
        }
    };

    const addMessage = (text, className) => {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', 
            className === 'bot-message' ? 'bot-message-container' : 'user-message-container',
            'fade-in', 'pop-up', 
            className === 'user-message' ? 'slide-in-left' : ''
        );

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className, 'fade-in', 'pop-up');
        messageElement.textContent = text;

        if (className === 'bot-message') {
            const botIcon = document.createElement('img');
            botIcon.src = 'images/bot-icon.jpeg';
            botIcon.alt = 'Bot Icon';
            botIcon.classList.add('bot-icon');
            messageContainer.appendChild(botIcon);
        }

        messageContainer.appendChild(messageElement);
        messagesContainer.prepend(messageContainer);
    };

    const addBotMessage = (text) => {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', 'bot-message-container', 'fade-in', 'slide-in');
        
        const botIcon = document.createElement('img');
        botIcon.src = 'images/bot-icon.jpeg';
        botIcon.alt = 'Bot Icon';
        botIcon.classList.add('bot-icon');
        messageContainer.appendChild(botIcon);
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message', 'fade-in');
        
        messageContainer.appendChild(messageElement);
        messagesContainer.prepend(messageContainer);
        
        setTimeout(() => {
            const loadingDots = createLoadingDots();
            loadingDots.classList.add('fade-in');
            messageElement.appendChild(loadingDots);
        
            setTimeout(() => {
                messageElement.removeChild(loadingDots);
                messageElement.textContent = text;
                messageContainer.classList.add('pop'); // Retain existing pop-up animation
            }, 1100);
        }, 0);
    };

    // New function to add image messages
    const addImageMessage = (imageUrl) => {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', 'bot-message-container', 'fade-in', 'slide-in');
        
        const botIcon = document.createElement('img');
        botIcon.src = 'images/bot-icon.jpeg';
        botIcon.alt = 'Bot Icon';
        botIcon.classList.add('bot-icon');
        messageContainer.appendChild(botIcon);
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message', 'fade-in');
        
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.alt = 'Generated Image';
        imageElement.classList.add('generated-image');

        // Add event listener to handle double-click for downloading
        imageElement.addEventListener('dblclick', () => downloadImage(imageUrl));

        messageElement.appendChild(imageElement);
        messageContainer.appendChild(messageElement);
        messagesContainer.prepend(messageContainer);
    };

    // Function to download image
    const downloadImage = (imageUrl) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'generated-image'; // Default file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const createLoadingDots = () => {
        const loadingContainer = document.createElement('div');
        loadingContainer.classList.add('dot-loading');

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.style.animationDelay = `${i * 0.2}s`;
            loadingContainer.appendChild(dot);
        }

        return loadingContainer;
    };

    const adjustInputHeight = () => {
        userInput.style.height = 'auto'; // Reset the height to auto to correctly calculate the scrollHeight
        userInput.style.height = `${Math.min(userInput.scrollHeight, 120)}px`; // Set height to scrollHeight with max height of 120px
    };

    const resetInputHeight = () => {
        userInput.style.height = '45px'; // Reset height to 45px
    };

    chatbotButton.addEventListener('click', () => {
        if (isChatbotButtonDisabled) return;
        toggleChatbot();
        isChatbotButtonDisabled = true;
        setTimeout(() => {
            isChatbotButtonDisabled = false;
        }, 4000); // Disable chatbot button for 4 seconds
    });

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent form submission or default action
            userInput.value += '\n'; // Insert a new line
            adjustInputHeight(); // Adjust height accordingly
        }
    });

    userInput.addEventListener('input', () => {
        adjustInputHeight();
        sendButton.disabled = !userInput.value.trim();
    });

    sendButton.style.display = 'none';
    userInput.addEventListener('focus', () => {
        sendButton.style.display = 'flex';
        toggleButtons('send');
    });

    userInput.addEventListener('blur', () => {
        setTimeout(() => {
            sendButton.style.display = 'none';
            toggleButtons('generate');
        }, 300);
    });

    userInput.addEventListener('focusout', () => {
        if (!userInput.value.trim()) {
            resetInputHeight();
        }
    });

    const toggleButtons = (buttonToShow) => {
        if (buttonToShow === 'send') {
            sendButton.classList.add('move-in');
            sendButton.classList.remove('pop-in');
            generateButton.classList.remove('move-in');
            generateButton.classList.add('pop-in');
        } else {
            sendButton.classList.remove('move-in');
            sendButton.classList.add('pop-in');
            generateButton.classList.add('move-in');
            generateButton.classList.remove('pop-in');
        }
    };

    sendButton.disabled = true;

    const togglePlaceholderText = () => {
        userInput.placeholder = userInput.placeholder.trim() === 'Type your message...' ? 'Generate image' : 'Type your message...';
        useGPT4 = !useGPT4; // Toggle between GPT-4 and DALL-E 3
    };

    generateButton.addEventListener('click', togglePlaceholderText);
});
