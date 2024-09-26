export default async function main(args) {
  // Extract input variables from args
  const { groqApiKey, userQuestion } = args.inputVars;

  // Validate that the required input variables are provided
  if (!groqApiKey || !userQuestion) {
    return {
      next: { path: 'error' },
      trace: [
        {
          type: "debug",
          payload: {
            message: "Missing required input variable: groqApiKey or userQuestion"
          }
        }
      ]
    };
  }

  // Define the URL for the Groq API
  const url = 'https://api.groq.com/openai/v1/chat/completions'; // Replace with the correct endpoint if different

  // Configure the request payload for the Groq API
  const data = {
    model: "llama-3.2-1b-preview",
    messages: [
      {
        "role": "user",
        "content": userQuestion
      }
    ]
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