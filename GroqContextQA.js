export default async function main(args) {
  // Extract input variables from args
  const { groqApiKey, userQuestion, chunks } = args.inputVars;

  // Validate that the required input variables are provided
  if (!groqApiKey || !userQuestion || !chunks) {
    return {
      next: { path: 'error' },
      trace: [
        {
          type: "debug",
          payload: {
            message: "Missing required input variable: groqApiKey, userQuestion, or chunks"
          }
        }
      ]
    };
  }

  // Define the URL for the Groq API
  const url = 'https://api.groq.com/openai/v1/chat/completions'; // Ensure this is the correct endpoint

  // Configure the request payload for the Groq API
  const data = {
    model: "llama-3.2-1b-preview",
    messages: [
      {
        "role": "system",
        "content": `You are PoppyChat, an FAQ AI chat assistant for Poppy Kids Pediatric Dentistry. It is imperative you respond as if you are part of the Poppy Kids organization, using pronouns like "I" and "we" when referring to Poppy Kids.`
      },
      {
        "role": "assistant",
        "content": `As a chat support agent, provide a clear and concise response to the user's question:

          ${userQuestion}
          
          Refer to the provided details:
          
          ${chunks}
          
          Instructions:
          
          - Deliver a friendly and conversational response, focusing on the key points without elaborate details.
          - For closed-ended questions that can be answered with "yes" or "no," begin your response with the direct answer followed by a brief explanation or additional context if needed.
          - For open-ended questions, deliver a friendly, conversational response, focusing on the key points.
          - Answer the user's question naturally and directly.
          - Limit the response to a maximum of two to three brief sentences.
          - Use bullet points when necessary.
          - Never start a response with a bullet point - you should answer the question directly and then show supplementary info in bullet points when necessary and appropriate.
          - Use simple, direct language and markdown for clarity.
          - Ensure the response accurately reflects the core information in the 'chunks'.
          - Speak in a natural, conversational tone as if you were speaking to the user in person.
          - Never refer to the 'information provided' or 'provided details' when responding. You should be responding naturally to the user.
          
          IMPORTANT:
          If the 'chunks' do not contain the needed information to answer the question, return nothing. 
          Take a deep breath, focus, and think clearly. You may now begin this mission-critical task.`
      },
      {
        "role": "user",
        "content": userQuestion
      }
    ],
    temperature: 0.1, // Update temperature
  };

  // Configure the fetch request headers and body
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqApiKey}`
    },
    body: JSON.stringify(data)
  };

  try {
    // Make the API call
    const response = await fetch(url, config);

    // Check if the response status is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const responseBody = await response.json;

    // Validate the responseBody structure as expected
    if (!responseBody || typeof responseBody !== 'object') {
      throw new Error("Invalid or missing response body from the API");
    }

    // Extract the response text from the completion
    const completion = responseBody.choices[0].message.content;

    // Create the success return object with extracted data
    return {
      outputVars: { completion },
      next: { path: 'success' },
      trace: [
        {
          type: "text",
          payload: { message: `${completion}` }
        }
      ]
    };
  } catch (error) {
    return {
      next: { path: 'error' },
      trace: [
        {
          type: "debug",
          payload: { message: "Error: " + error.message }
        }
      ]
    };
  }


}