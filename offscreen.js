chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "offscreen-doc") {
    return;
  }

  // Dispatch the message to an appropriate handler.
  switch (message.type) {
    case "SET_SOUND":
      playAudio(message.play);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
  }
}

// Play sound with access to DOM APIs
function playAudio({ source, volume }) {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play();
}
