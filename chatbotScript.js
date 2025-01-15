//if (matchedQuestions.length > 0) {
    //             matchedQuestions.forEach(item => {
    //                 const questionAnswer = `
    //                     <div class="response-item">
    //                         <strong> ${item.question}</strong>
    //                         <p>${item.answer}</p>
    //                     </div>
    //                 `;
    //                 responseArea.innerHTML += questionAnswer;
    //             });
    //         } else {
    //             // If no questions matched, show a custom message
    //             const apologyMessage = `
    //                 <div class="response-item">
    //                     <p><strong>Bot:</strong> Sorry, I can't help. Please enter a valid question.</p>
    //                 </div>
    //             `;
    //             responseArea.innerHTML += apologyMessage;
    //         }
    
    //     } catch (error) {
    //         console.error(error);
    //         document.getElementById('response-area').innerHTML = 'Error fetching data.';
    //     }
    
    //     // Clear the input field after processing
    //     document.getElementById('user-query').value = '';
    
    //     // Scroll to the bottom of the response area
    //     const responseArea = document.getElementById('response-area');
    //     responseArea.scrollTop = responseArea.scrollHeight;
    // });
    // Fetch the JSON data from questions.json
    async function fetchQuestions() {
        const response = await fetch('http://localhost:8008/chatbotData.json'); // Use the correct server URL
        if (!response.ok) {
            throw new Error('Failed to load questions.json');
        }
        return response.json();
    }
    
    document.getElementById('ask-btn').addEventListener('click', async function() {
        // Get the user input
        const userQuery = document.getElementById('user-query').value.toLowerCase().trim();
    
        // If the input is empty, show a message
        if (!userQuery) {
            document.getElementById('response-area').innerHTML = '<p>Please enter a question!</p>';
            return;
        }
    
        try {
            // Fetch the questions and answers from the JSON file
            const questions = await fetchQuestions();
            const matchedQuestions = [];
    
            // Check for keywords in the user's query
            questions.forEach(item => {
                item.keywords.forEach(keyword => {
                    if (userQuery.includes(keyword.toLowerCase())) {
                        matchedQuestions.push(item);
                    }
                });
            });
    
            // Display matched responses
            const responseArea = document.getElementById('response-area');
            responseArea.innerHTML = ''; // Clear previous responses
    
            if (matchedQuestions.length > 0) {
                matchedQuestions.forEach(item => {
                    const questionAnswer = `
                        <div class="response-item">
                            <strong>${item.question}</strong>
                            <p>${item.answer}</p>
                        </div>
                    `;
                    responseArea.innerHTML += questionAnswer;
                });
            } else {
                // No match found
                const apologyMessage = `
                    <div class="response-item">
                        <p><strong>Bot:</strong> Sorry, I can't help. Please enter a valid question.</p>
                    </div>
                `;
                responseArea.innerHTML += apologyMessage;
            }
    
            // Add options for continuation or ending the chat
            const followUpMessage = `
                <div class="response-item">
                    <p><strong>Bot:</strong> Do you have any other queries?</p>
                    <button id="yes-btn" class="response-option">Yes</button>
                    <button id="no-btn" class="response-option">End Chat</button>
                </div>
            `;
            responseArea.innerHTML += followUpMessage;
    
            // Add event listeners for the options
            document.getElementById('yes-btn').addEventListener('click', () => {
                responseArea.innerHTML += '<p><strong>Bot:</strong> Please ask your next question.</p>';
            });
    
            document.getElementById('no-btn').addEventListener('click', () => {
                responseArea.innerHTML += '<p><strong>Bot:</strong> Thanks! We are always here to support you.</p>';
            });
    
        } catch (error) {
            console.error(error);
            document.getElementById('response-area').innerHTML = 'Error fetching data.';
        }
    
        // Clear the input field
        document.getElementById('user-query').value = '';
    
        // Scroll to the bottom of the response area
        const responseArea = document.getElementById('response-area');
        responseArea.scrollTop = responseArea.scrollHeight;
    });