function changeChannel(e) {
  let active_channel = document.querySelector(".active");

  if (active_channel) {
    active_channel.classList.remove("active");
  }

  e.currentTarget.classList.add("active");
  populateMessages(e.currentTarget.getAttribute("data-channel"));
  document.querySelector("#channel-title").innerText =
    e.currentTarget.innerText;
}

// **Message Display**
// - This code should replace `"INSERT CODE HERE"` inside the `populateMessages` function.
// - The `chat` parameter will receive the chat ID for the current channel.
// - Use this API endpoint to get the messages using the channel ID:
// `https://slackclonebackendapi.onrender.com/messages?channelId=${chat}`
// - Loop through each message returned and display:
// - The sender’s name.
// - The message text.
// - To get the sender’s name, use the `senderId` attribute in the message object.
// Use this API endpoint:
// `https://slackclonebackendapi.onrender.com/users?id=${message.senderId}`
// - Make sure you pay attention to the type of JSON object returned (it is an array of matching results).
// - Append each message to the channel.

async function populateMessages(chat) {
  document.querySelectorAll(".message").forEach((item) => item.remove());

  // grabbing the existing template in the html
  let template = document.querySelector("template");

  // grabbing our messages from the first api
  let messages = await fetch(
    `https://slackclonebackendapi.onrender.com/messages?channelId=${chat}`,
  );
  // converting messages object to json
  let messages_json = await messages.json();
  console.log(messages_json);

  // clearing out chat container
  let chat_container = document.querySelector("#chat-messages");
  chat_container.innerHTML = "";

  // for loop to populate all messages in messages json
  for (let message of messages_json) {
    // clone message template
    let message_html_element = template.content.cloneNode(true);

    // set message text
    message_html_element.querySelector(".text").innerText = message.content;

    // fetch sender info
    let second_api_object = await fetch(
      `https://slackclonebackendapi.onrender.com/users?id=${message.senderId}`,
    );
    let second_api_object_json = await second_api_object.json();
    console.log(second_api_object_json);

    // set sender name - added the if statement because i kept getting an error where my messages wouldn't send because I wasn't consistently grabbing a sender name
    if (second_api_object_json.length > 0) {
      message_html_element.querySelector(".sender").innerText =
        second_api_object_json[0].name + ":";
    } else {
      message_html_element.querySelector(".sender").innerText = "Unknown:";
    }

    // append message to chat
    chat_container.appendChild(message_html_element);
  }
}

// **Get the Channels**
// This code should replace `"INSERT CODE HERE"` inside the `init` function.
// Use this API endpoint:
// `https://slackclonebackendapi.onrender.com/channels`
// Loop through the returned array and:
// - Create a new `button` element.
// - Add the `channel` class.
// - Set the `data-channel` attribute to the `id` of each object.
// - Set the `innerText` to the `name` of the object.
// - Append the button to the HTML element with the class `channel-list`.

async function init() {
  let init_var = await fetch(
    "https://slackclonebackendapi.onrender.com/channels",
  );
  let init_var_json = await init_var.json();
  console.log(init_var_json);

  for (let object of init_var_json) {
    // creating the button for each element
    let button = document.createElement("button");
    // adding the channel class to our button
    button.classList.add("channel");
    button.dataset.channel = object.id;
    // setting the inner text to the name of the object
    button.innerText = object.name;
    // appending button to HTML element with the class 'channel-list'
    document.querySelector(".channel-list").appendChild(button);
  }

  document
    .querySelectorAll(".channel")
    .forEach((item) => item.addEventListener("click", changeChannel));

  document.querySelector(".channel").classList.add("active");
  populateMessages(document.querySelector(".channel").dataset.channel);
  document.querySelector("#channel-title").innerText =
    document.querySelector(".channel").innerText;
}

init();

// **Sending Messages (Extra Credit)**
//-You will have to write this function yourself and add an event listener.
//-Users can type a message and click a send button.
//-The new message should:
// - Be added to the correct channel.
// - Display immediately in the chat window.
// - Be styled as a user message (pick a random `userId` and use that).
// - Clear the input box.
//-Make sure you are sending a POST request to this API endpoint:
// `https://slackclonebackendapi.onrender.com/messages`
//-To see an example message, look at the data returned from:
// `https://slackclonebackendapi.onrender.com/messages`
// You will need to supply all the required data except for the `id`, which is automatically generated by the backend when you make your POST request.
// Bonus: If this works, your classmates will see your message since this is an active API shared across all projects including projects in IS 5750 (React).
// Please keep all messages professional.

// I took my best stab at this!

async function sendMessage() {
  // grabbing our message input tag
  let input = document.querySelector("#message-input");
  // grabbing the text value a user types into the input box
  let message_text = input.value.trim();

  // protecting from posting a message that is nothing
  if (message_text === "") {
    return;
  }
  // grabbing the active channel so we can post our message to the correct place
  // note for myself, .channel.active will search for an HTML element that has both of these classes
  let active_channel = document.querySelector(".channel.active");

  if (active_channel === null) {
    return;
  }

  // pick a random user id
  let random_user_id = Math.floor(Math.random() * 5) + 1;

  // isolate our current channel
  let current_channel_id = parseInt(active_channel.dataset.channel);

  // building the new message object that we will post to the api!
  let new_message = {
    channelId: current_channel_id,
    senderId: random_user_id,
    content: message_text,
  };

  let response = await fetch(
    "https://slackclonebackendapi.onrender.com/messages",
    {
      // telling the server that we're sending data in JSON format!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(new_message),
    },
  );

  // grabbing our new json object from the API so we can see it from our end when inspecting
  let response_json = await response.json();
  console.log(response_json);

  // reseting the text box after we send a message!
  input.value = "";

  // calling populate message to populate our new message
  populateMessages(current_channel_id);
}

// adding our final event listener so sendMessage will work isolated to the send button
document
  .querySelector(".chat-input button")
  .addEventListener("click", sendMessage);
