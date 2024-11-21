const buttonArea = document.getElementById('button-area');
const chatWindow = document.getElementById('chatbox');
const inputArea = document.getElementById('input-area');

const welcome = [
    "Hello",
    "Welcome to Cyber Crime Chatbot",
    "This chatbot is an initiative of Govt. of India to report cyber crime complaints online",
];

const questions = [
  {
    type: "text",
    key: "name", 
    question: "What is your name ?"
  },
  {
    type: "text",
    key: "age",
    question: "How old are you ?",
    validate: (answer) => !isNaN(answer) && answer > 0
  },
  {
    type: "text",
    key: "email",
    question: "What is your email ?",
    validate: (answer) => /\S+@\S+\.\S+/.test(answer)
  },
  { 
    type: "datetime-local",
    key: "incidentDateTime", 
    question: "Please select incident date and time"
  },
  {
    type: "text1",
    key: "incidentDetails", 
    question: "Incident details (maximum 200 characters) without any special characters (#$@^*`’’~|!).",
    validate: (answer) => {
      const specialCharacters = /[#$@^*`’’~|!]/g;
      return answer.length <= 200 && !specialCharacters.test(answer);
    }
  },
  {
    type: "upload",
    key: "nationalId",
    question: "Please upload Soft copy of any national Id ( Voter Id, Driving license, Passport, PAN Card, Aadhar Card) of complainant in .jpeg, .jpg, .png format (file size should not more than 5 MB).",
    accept: ['image/jpeg', 'image/jpg', 'image/png'],
    validate: (files) => {
      const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes
      return files.every(file =>
        ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) && file.size <= maxFileSize
      );
    }
  },
  { 
    type: "text",
    key: "bankName", 
    question: "Please type name of the Bank/ Wallet/ Merchant"
  },
  { 
    type: "text",
    key: "transactionId_UTR", 
    question: "Please type Transaction Id/ UTR No.",
  },
  { 
    type: "datetime-local",
    key: "transactionDateTime", 
    question: "Please select Date of transaction"
  },
  {
    type: "text",
    key: "fraudAmount",
    question: "Enter the Fraud Amount",
    validate: (answer) => {
      const amount = parseFloat(answer);
      return !isNaN(amount) && amount > 0;
    }
  },
  {
    type: "upload",
    key: "evidenceDoc",
    question: "Please upload Soft copy of all the relevant evidences related to the cyber crime (not more than 10 MB each)",
    accept: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    validate: (files) => {
      // Check if each file is less than or equal to 5 MB
      const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes
      return files.every(file => file.size <= maxFileSize);
    }
  },
  {
    type: "skippable",
    key: "website", 
    question: "Suspected website URLs/ Social Media handles (wherever applicable)"
  },
  {
    type: "options",
    key: "other",
    question: "Do you have any information about the suspect ?",
    options: ["Yes","No"],
  },
  {
    type: "checkbox",
    key: "suspectInfo",
    question: "Select the types of information you have about the suspect:",
    options: ["Mobile No", "Email Id", "Bank Account No", "Address", "Photograph", "Other Documents"],
  },
  {
    checkboxOptionsIndex: 0, 
    type: "text",
    key: "suspect_mobileNo", 
    question: "Mobile No. of suspect ?",
    validate: (answer) => !isNaN(answer) && answer > 0
  },
  {
    checkboxOptionsIndex: 1, 
    type: "text",
    key: "suspect_email", 
    question: "Email Id of suspect ?",
    validate: (answer) => /\S+@\S+\.\S+/.test(answer)
  },
  {
    checkboxOptionsIndex: 2,
    type: "text",
    key: "suspect_bankAccountNo", 
    question: "Bank Account No. of suspect ?",
    validate: (answer) => !isNaN(answer) && answer > 0
  },
  {
    checkboxOptionsIndex: 3, 
    type: "text",
    key: "suspect_address", 
    question: "Address of suspect ?"
  },
  {
    checkboxOptionsIndex: 4,
    type: "upload",
    key: "suspect_photograph",
    question: "Please upload Soft copy of photograph of the suspect in .jpeg, .jpg, .png format (not more than 5 MB)",
    accept: ['image/jpeg', 'image/jpg', 'image/png'],
    validate: (files) => {
      const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes
      return files.every(file =>
        ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) && file.size <= maxFileSize
      );
    }
  },
  {
    checkboxOptionsIndex: 5,
    type: "upload",
    key: "suspect_document",
    question: "Any other document through which suspect can be identified",
    accept: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    validate: (files) => {
      // Check if each file is less than or equal to 5 MB
      const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes
      return files.every(file => file.size <= maxFileSize);
    }
  },
];

let currentQuestion = 0;

let userData = {};

let nationalId, evidenceDoc, suspect_photograph, suspect_document;

function setWelcomeTimeout(callback, index) {
  setTimeout(callback, 500 * index);
}

function displayWelcomeMessage(message, sender) {
  const elm = document.createElement("p");
  elm.innerHTML = message;
  elm.setAttribute("class", "bot");
  chatWindow.appendChild(elm);
}

// Function to format the current date and time
function getCurrentDateTime() {
  const now = new Date();
  
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');

  // Determine AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Replace 0 with 12 for midnight

  // Combine components into the desired format
  return `${hours}:${minutes} ${ampm}`;
}

//Function to display a message
function displayMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);

  // Create a span for the timestamp
  const timestampSpan = document.createElement('span');
  timestampSpan.classList.add('timestamp', `${sender}-timestamp`);
  timestampSpan.innerText = getCurrentDateTime();

  // Append the message and timestamp to the messageDiv
  messageDiv.innerText = message;
  

  chatWindow.appendChild(messageDiv);
  chatWindow.appendChild(timestampSpan);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display options, text input, or file upload input
function displayInput(question) {
  inputArea.innerHTML = '';

  //Remove existing options if any
  const existingOptionButtons = document.querySelectorAll('.option-button');
  existingOptionButtons.forEach(button => button.remove());

  if (question.type === 'options') {
    var index=0;
    question.options.forEach(option => {
      const button = document.createElement('button');
      button.classList.add('option-button');
      button.value=index;
      button.innerText = option;
      button.addEventListener('click', () => handleOptionClick(option,button.value));
      chatWindow.appendChild(button);
      index++;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    });

  } else if (question.type === 'text') {
    const txtAnswer = document.createElement('input');
    txtAnswer.id = 'userInput';
    txtAnswer.type = 'text';
    txtAnswer.placeholder = 'Type your message here ...';

    const sendButton = document.createElement('button');
    sendButton.id = 'send-button';
    sendButton.innerText = 'Send';
    sendButton.addEventListener('click', () => handleTextSubmit(txtAnswer.value));

    inputArea.appendChild(txtAnswer);
    inputArea.appendChild(sendButton);
    
    txtAnswer.focus();

  } else if (question.type === 'upload') {

    const fileUpload = document.createElement('input');
    fileUpload.id = 'fileInput';
    fileUpload.type = 'file';

    const uploadButton = document.createElement('button');
    uploadButton.id = 'upload-button';
    uploadButton.innerText = 'Upload';

    uploadButton.addEventListener('click', () => handleFileUpload(question.key));

    inputArea.appendChild(fileUpload);
    inputArea.appendChild(uploadButton);

  } else if (question.type === 'datetime-local') {
    const dateTimeInput = document.createElement('input');
    dateTimeInput.id = 'dateTimeInput';
    dateTimeInput.type = 'datetime-local';

    const submitButton = document.createElement('button');
    submitButton.id = 'submit-button1';
    submitButton.innerText = 'Submit';
    submitButton.addEventListener('click', () => handleDateTimeSubmit(dateTimeInput.value));

    inputArea.appendChild(dateTimeInput);
    inputArea.appendChild(submitButton);

  } else if (question.type === 'skippable') {
    const txtAnswer = document.createElement('input');
    txtAnswer.id = 'userInput';
    txtAnswer.type = 'text';
    txtAnswer.placeholder = 'Type your message here ...';

    const skipButton = document.createElement('button');
    skipButton.id = 'skip-button';
    skipButton.innerText = 'Skip >>>';
    skipButton.addEventListener('click', () => handleSkipClick(txtAnswer.value));

    const sendButton = document.createElement('button');
    sendButton.id = 'send-button';
    sendButton.innerText = 'Send';
    sendButton.addEventListener('click', () => handleTextSubmit(txtAnswer.value));

    inputArea.appendChild(txtAnswer);
    chatWindow.appendChild(skipButton);
    inputArea.appendChild(sendButton);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    txtAnswer.focus();

  } else if (question.type === 'checkbox') {
    const container = document.createElement('div');
    container.classList.add('container');

    question.options.forEach(option => {
      const cat = document.createElement('div');
      cat.classList.add('cat');

      const label = document.createElement('label');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;

      const span = document.createElement('span');
      span.innerText = option;

      label.prepend(span);
      label.prepend(checkbox);
      cat.prepend(label);
      container.prepend(cat);
      chatWindow.appendChild(container);
    });

    const submitButton = document.createElement('button');
    submitButton.id = 'submit-button';
    submitButton.innerText = 'Submit';
    submitButton.addEventListener('click', handleCheckboxSubmit);

    inputArea.appendChild(submitButton);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } else if (question.type === 'text1') {
    const txtAnswer = document.createElement('input');
    txtAnswer.id = 'incidentDetailsInput';
    txtAnswer.placeholder = 'Type incident details here...';
    txtAnswer.maxLength = 200;
    txtAnswer.addEventListener('input', () => updateCharacterCount(txtAnswer.value.length));

    const charCount = document.createElement('div');
    charCount.id = 'charCount';
    charCount.innerText = `Remaining characters: ${200 - txtAnswer.value.length}`;

    const sendButton = document.createElement('button');
    sendButton.id = 'send-button';
    sendButton.innerText = 'Send';
    sendButton.addEventListener('click', () => handleTextSubmit(txtAnswer.value));

    inputArea.appendChild(txtAnswer);
    inputArea.appendChild(sendButton);
    inputArea.appendChild(charCount);
    
    txtAnswer.focus();
  }
}

// Update character count in incident details input
function updateCharacterCount(currentLength) {
  const remaining = 200 - currentLength;
  const charCountDisplay = document.getElementById('charCount');
  charCountDisplay.innerText = `Remaining characters: ${remaining}`;
}

// Handle Checkbox
function handleCheckboxSubmit() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const selectedOptions = Array.from(checkboxes).map(checkbox => checkbox.value);

  // If no options are selected, display a message and return early
  if (selectedOptions.length === 0) {
    displayMessage("Please select atleast one option...", 'bot');
    return; // Exit the function if no checkboxes are selected
  }

  // Remove the submit button after it is clicked
  const submitButton = document.getElementById('submit-button');
  if (submitButton) {
    submitButton.remove();
  }

  // Disable all checkbox options after submission
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    checkbox.disabled = true; // Disable each checkbox
  });

  // Clear any questions after the checkbox question
  const nextQuestions = [];

  // Loop through the questions and add relevant ones to the flow
  selectedOptions.forEach(option => {
    const index = questions[13].options.indexOf(option); // Question 13 is the checkbox question
    questions.forEach(question => {
      if (question.checkboxOptionsIndex === index) {
        nextQuestions.push(question);
      }
    });
  });

  // Replace the upcoming questions with the relevant ones
  questions.splice(currentQuestion + 1, questions.length - currentQuestion - 1, ...nextQuestions);

  goToNextQuestion();
}

// Handle option click
function handleOptionClick(option, index) {
  displayMessage(option, 'user');

  // Remove all option buttons after one is clicked
  const optionButtons = document.querySelectorAll('.option-button');
  optionButtons.forEach(button => button.remove());

  // Check if the selected option is "No" and finish the chat
  if (option === "No") {
    setTimeout(() => {
      displayFinalMessage(); // Directly show the final message
    }, 500);
  } else {
    currentQuestion++; // Move to the next question as usual

    if (currentQuestion < questions.length) {
      setTimeout(() => {
        displayQuestion();
      }, 500);
    }
  }
}

// Handle skip click
function handleSkipClick(text) {
  const skipButton = document.getElementById('skip-button');
  skipButton.remove();
  goToNextQuestion();
}

// Handle text submission
function handleTextSubmit(text) {
  
  if (text.trim() === '') return;
  displayMessage(text, 'user');
  handleResponse(text);
}

// To handle user responses
function handleResponse(text) {
  if (currentQuestion < questions.length) {
    const { key, validate, type } = questions[currentQuestion];

    if ((key === 'email' || key === 'suspect_email') && validate && !validate(text)) {
      displayMessage("Email Id must be in proper format. eg. abc@gmail.com", 'bot');
    }
     else if (validate && !validate(text)) {
        displayMessage("Invalid answer, please try again.", 'bot');
    } else {
       userData[key] = text;
        goToNextQuestion();
      } 
  }
}


// Handle file upload
async function handleFileUpload(key) {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    displayMessage('Please select a file', 'bot');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      displayMessage('File uploaded successfully.', 'bot');
      userData[key] = data.filename;

      goToNextQuestion();
      
    } else {
      displayMessage('File upload failed.', 'bot');
    }
  } catch (error) {
    console.error('Error:', error);
    displayMessage('An error occurred while uploading the file', 'bot');
  }
}

// async function handleFileDownload(filename) {
//   try {
//     const response = await fetch('http://localhost:3000/download', {
//       method: 'POST',
//       body: JSON.stringify({
//         path: `uploads/${filename}`
//       })
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     // displayMessage('An error occurred while uploading the file', 'bot');
//   }
// }


// Handle date and time submission
function handleDateTimeSubmit(dateTime) {
  if (!dateTime) return;

  const dateObj = new Date(dateTime);

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDateTime = `${formattedDate} ${formattedTime}`;

  displayMessage(formattedDateTime, 'user');
  handleResponse(formattedDateTime);
}

// Proceed to the next question
function goToNextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    setTimeout(() => {
      displayQuestion();
    }, 500);
  } else {
    setTimeout(() => {
      displayMessage("Thank you! Your responses have been recorded.", 'bot');
      inputArea.innerHTML = '';
      displayFinalOptions();

      // Save userData to the JSON server
      saveUserData(userData);

    }, 500);
  }
}

// Display the current question
function displayQuestion() {
  const current = questions[currentQuestion];
  displayMessage(current.question, 'bot');
  displayInput(current);
}

// Start the chatbot
window.onload = () => {
  welcome.forEach((message, index) => {
    setWelcomeTimeout(() => {
      displayWelcomeMessage(message, 'bot');
    }, index);
  });

  setTimeout(() => {
    displayQuestion();
  }, welcome.length * 500);

  let params = new URL(document.location.toString()).searchParams;
   let mobile = params.get("mobile")
   console.log(mobile);
}

// Function to display the final message
function displayFinalMessage() {
  displayMessage("Thank you! Your responses have been recorded.", 'bot');
  inputArea.innerHTML = '';
  displayFinalOptions();

  // Optionally, can also call a function to save userData
  saveUserData(userData);
}

function displaySummary() {
  chatWindow.innerHTML = ''; 
  
  const summaryDiv = document.createElement('div');
  summaryDiv.classList.add('summary-section');
  
  const heading = document.createElement('h2');
  heading.innerText = "Summary of your responses:";
  summaryDiv.appendChild(heading);

  // Define a mapping of labels to the keys in userData
  const summaryLabels = {
    name: 'Name',
    age: 'Age',
    email: 'Email',
    incidentDateTime: 'Incident Date & Time',
    incidentDetails: 'Incident Details',
    nationalId: 'National Id', // upload
    bankName: 'Bank Name',
    transactionId_UTR: 'Transaction Id /UTR',
    transactionDateTime: 'Transaction Date & Time',
    fraudAmount: 'Fraud Amount (in Rs.)',
    evidenceDoc: 'Evidence Documents', // upload
    website: 'Suspected website URLs/Social Media Handles',
    suspectInfo: 'Information of Suspect',
    suspect_mobileNo: 'Mobile No. of suspect',
    suspect_email: 'Email of suspect',
    suspect_bankAccountNo: 'Bank Account No. of suspect',
    suspect_address: 'Address. of suspect',
    suspect_photograph: 'Photograph of suspect', // upload
    suspect_document: 'Any document related to suspect', // upload
  };

  for (const key in summaryLabels) {
    if (userData.hasOwnProperty(key)) {
      const label = summaryLabels[key];
      let userAnswer = userData[key] || "No answer provided";
    
    console.log(`Key: ${key}, Value: `, userAnswer);

    // if (typeof userAnswer === 'object' && userAnswer.name) {
    //   userAnswer = userAnswer.name; // Display the file name
    // }

    // Check if userAnswer is an array of files
    if (['nationalId', 'evidenceDoc', 'suspect_photograph', 'suspect_document'].includes(key)) {
      // const fileLinks = userAnswer.map(file => {
      //   // Assume each file object has a `name` and a `url` property
      //   return `<a href="${file.url}" download="${file.name}">${file.name}</a>`;
      // }).join(', '); // Join links with a comma
      userAnswer = `<a href="/uploads/${userAnswer}" download="${userAnswer}">${userAnswer}</a>` || "No files uploaded";

    } else if (typeof userAnswer === 'object' && userAnswer.name) {
      userAnswer = userAnswer.name; // Display the file name
    }

      const summaryItem = document.createElement('p');
      summaryItem.innerHTML = `<strong>${label}:</strong> ${userAnswer}`;
      
      summaryDiv.appendChild(summaryItem);
    }
  }
  chatWindow.appendChild(summaryDiv);
  
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// To display final options
function displayFinalOptions() {
  // const newComplaintButton = document.createElement('button');
  // newComplaintButton.innerText = "New Complaint";
  // newComplaintButton.classList.add('final-option-button');
  // newComplaintButton.addEventListener('click', () => {
  //   location.reload(); // Reload the page to start a new complaint
  // });

  // const callUsButton = document.createElement('button');
  // callUsButton.innerText = "Call Us";
  // callUsButton.classList.add('final-option-button');
  // callUsButton.addEventListener('click', () => {
  //   // Display the call information (or can initiate a call if integrated with a call system)
  //   displayMessage("Please call us at: +91-XXXXXXXXXX", 'bot');
  // });

  const summaryButton = document.createElement('button');
  summaryButton.innerText = "See Summary";
  summaryButton.classList.add('summary-button');
  summaryButton.addEventListener('click', () => {
    displaySummary();
  });

  // buttonArea.appendChild(newComplaintButton);
  // buttonArea.appendChild(callUsButton);

  inputArea.appendChild(summaryButton);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// // To save user data in database
// function saveUserData(userData) {
//   console.log(JSON.stringify(userData));
//     fetch('http://localhost:3000/saveUserData', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         if (data.success) {
//             displayMessage(`Data saved successfully with ID: ${data.id}`, 'bot');
//         }
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//         displayMessage('Failed to save data.', 'bot');
//     });
// }

// To save user data in database
function saveUserData(userData) {
  console.log(JSON.stringify(userData));

  const formData = new FormData();
  
  // Append user data to FormData
  for (const key in userData) {
      if (userData.hasOwnProperty(key)) {
        const value = userData[key];

        if (typeof value === 'object' && value.hasOwnProperty('name')) {
          const fileInput = document.getElementById('fileInput');
          formData.append(key, fileInput.files[0]);
        } else {
          formData.append(key, value);
        }
      }
  }

  fetch('http://localhost:3000/saveUserData', {
      method: 'POST',
      body: formData, // Use FormData to send both files and other data
  })
  .then(response => {
      if (!response.ok) {
          // Handle response errors here
          return response.text().then(errorMessage => {
              throw new Error(`Network response was not ok: ${response.status} - ${errorMessage}`);
          });
      }
      return response.json();
  })
  .then(data => {
      console.log('Success:', data);
      if (data.success) {
          displayMessage(`Data saved successfully with ID: ${data.data._id}`, 'bot');
      }
  })
  .catch((error) => {
      console.error('Error:', error);
      displayMessage('Failed to save data.', 'bot');
  });
}
