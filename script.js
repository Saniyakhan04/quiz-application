// script.js

// Global variables for quiz state
let quizData = [];
let userAnswers = []; // Stores the index of the selected choice for each question
let currentQuestionIndex = 0;
let timerInterval;
let timeLeft = 30 * 60; // 30 minutes in seconds
let visitedQuestions = new Set();
let attemptedQuestions = new Set();
let revisitQuestions = new Set();

let userEmail = ''; // This will be set from the input on the start page

// --- DOM Elements ---
const startPage = document.getElementById('start-page');
const guidelinesPage = document.getElementById('guidelines-page'); // NEW
const quizPage = document.getElementById('quiz-page');
const reportPage = document.getElementById('report-page');

const emailInput = document.getElementById('email-input');
const continueBtn = document.getElementById('continue-btn'); // NEW
const startQuizBtn = document.getElementById('start-quiz-btn');
const emailError = document.getElementById('email-error');

const timerDisplay = document.getElementById('timer');
const currentQNumDisplay = document.getElementById('current-q-num');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');

const questionNavGridHeader = document.getElementById('question-nav-grid-header');
const reportContent = document.getElementById('report-content');
const restartQuizBtn = document.getElementById('restart-quiz-btn');

const messageBox = document.getElementById('message-box');
const userEmailDisplay = document.getElementById('user-email-display');

const guidelinesBtn = document.getElementById('guidelines-btn');

// Loader element
const loaderScreen = document.getElementById('loading-screen');

// --- Utility Functions ---

/**
 * Shows a specific page and hides others.
 * @param {string} pageId The ID of the page to show.
 */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');  // Hide all first
  const page = document.getElementById(pageId);
  page.classList.add('active');
  page.style.display = 'block';
}


/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

/**
 * Decodes HTML entities from a string.
 * @param {string} html The HTML string to decode.
 * @returns {string} The decoded string.
 */
function decodeHtml(html) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
}

/**
 * Displays a temporary message to the user.
 * @param {string} message The message to display.
 * @param {string} type The type of message ('error' or 'success').
 */
function showMessage(message, type = 'error') {
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-red-500', 'bg-green-500');
    if (type === 'error') {
        messageBox.classList.add('bg-red-500', 'text-white');
    } else if (type === 'success') {
        messageBox.classList.add('bg-green-500', 'text-white');
    }
    messageBox.classList.add('block'); // Ensure it's visible
    setTimeout(() => {
        messageBox.classList.remove('block');
        messageBox.classList.add('hidden');
    }, 3000); // Hide after 3 seconds
}

// --- Quiz Logic ---

/**
 * Initializes the quiz: fetches questions, starts timer, displays first question.
 */
async function startQuiz() {
    userEmail = emailInput.value.trim();
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        emailError.classList.remove('hidden');
        return;
    }
    emailError.classList.add('hidden');
    userEmailDisplay.textContent = userEmail;

    // Show the loading screen while fetching questions
    showPage('loading-screen');

    await fetchQuestions();

    if (quizData.length > 0) {
        userAnswers = new Array(quizData.length).fill(null);
        visitedQuestions.add(0);
        displayQuestion();
        startTimer();
        updateNavigationPanel();

        // Once everything is ready, show the quiz page
        showPage('quiz-page');
    } else {
        questionText.innerHTML = "Failed to load quiz questions. Please try again.";
        nextBtn.disabled = true;
        prevBtn.disabled = true;

        // Return user to start page if loading failed
        showPage('start-page');
    }
}


/**
 * Fetches quiz questions from the Open Trivia Database API.
 */
async function fetchQuestions() {
    try {
        // Fetch 15 multiple-choice questions
        const response = await fetch('https://opentdb.com/api.php?amount=15&type=multiple');
        const data = await response.json();
        if (data.response_code === 0) {
            quizData = data.results.map(q => {
                // Combine correct and incorrect answers and shuffle them
                const choices = shuffleArray([
                    decodeHtml(q.correct_answer),
                    ...q.incorrect_answers.map(decodeHtml)
                ]);
                return {
                    question: decodeHtml(q.question),
                    correct_answer: decodeHtml(q.correct_answer),
                    choices: choices
                };
            });
        } else {
            console.error('API Error:', data.response_code);
            showMessage('Failed to fetch quiz questions. Please try again later.', 'error');
            // Fallback to start page or show error message
            showPage('start-page');
        }
    } catch (error) {
        console.error('Network or API error:', error);
        showMessage('An error occurred while fetching questions. Please check your internet connection and try again.', 'error');
        showPage('start-page');
    }
}

/**
 * Displays the current question and its choices.
 */
function displayQuestion() {
    if (quizData.length === 0) return; // No questions loaded

    const question = quizData[currentQuestionIndex];
    questionText.innerHTML = `${currentQuestionIndex + 1}. ${question.question}`;
    choicesContainer.innerHTML = ''; // Clear previous choices

    question.choices.forEach((choice, index) => {
        const label = document.createElement('label');
        label.classList.add('choice-label');

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'quiz-choice'; // All radios for a question share the same name
        radioInput.value = index;
        radioInput.dataset.index = index; // Store choice index for easy retrieval
        radioInput.onchange = () => selectAnswer(index); // Use onchange for radio buttons

        const customRadioSpan = document.createElement('span');
        customRadioSpan.classList.add('custom-radio');

        const choiceTextSpan = document.createElement('span');
        choiceTextSpan.classList.add('choice-text');
        choiceTextSpan.innerHTML = choice;

        label.appendChild(radioInput);
        label.appendChild(customRadioSpan);
        label.appendChild(choiceTextSpan);

        // If user has already answered this question, mark the selected choice
        if (userAnswers[currentQuestionIndex] === index) {
            label.classList.add('selected');
            radioInput.checked = true; // Mark the radio button as checked
        }
        choicesContainer.appendChild(label);
        // Debug log to confirm element creation
        console.log('Appended choice label:', label.outerHTML);
    });

    // Update navigation buttons state
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = (currentQuestionIndex === quizData.length - 1 && userAnswers[currentQuestionIndex] === null);

    // Mark current question as visited
    visitedQuestions.add(currentQuestionIndex);
    updateNavigationPanel();
    currentQNumDisplay.textContent = currentQuestionIndex + 1;
}

/**
 * Handles user selecting an answer.
 * @param {number} selectedChoiceIndex The index of the selected choice.
 */
function selectAnswer(selectedChoiceIndex) {
    console.log('selectAnswer called with index:', selectedChoiceIndex); // Debug log

    // Remove 'selected' class from all choice labels for the current question
    Array.from(choicesContainer.children).forEach(label => {
        label.classList.remove('selected');
    });

    // Add 'selected' class to the clicked label
    const selectedLabel = choicesContainer.children[selectedChoiceIndex];
    selectedLabel.classList.add('selected');

    // Store the user's answer
    userAnswers[currentQuestionIndex] = selectedChoiceIndex;
    attemptedQuestions.add(currentQuestionIndex); // Mark as attempted
    updateNavigationPanel();

    // Enable next button if it was disabled (e.g., on the last question)
    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.disabled = false;
    }
}

/**
 * Moves to the next question.
 */
function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        // If on the last question, submit the quiz
        submitQuiz(); // This will take them to the report page
    }
}

/**
 * Moves to the previous question.
 */
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

/**
 * Jumps to a specific question by index.
 * @param {number} index The index of the question to go to.
 */
function goToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
}

/**
 * Updates the navigation panel (question grid) in the header with visited and attempted states.
 */
function updateNavigationPanel() {
    questionNavGridHeader.innerHTML = ''; // Clear previous navigation items
    for (let i = 0; i < quizData.length; i++) {
        const navItem = document.createElement('div');
        navItem.classList.add('nav-item');
        navItem.textContent = i + 1;
        navItem.onclick = () => goToQuestion(i);

       if (i === currentQuestionIndex) {
       navItem.classList.add('current'); // Blue for current
        } else if (revisitQuestions.has(i)) {
            navItem.classList.add('revisit');   // Yellow for revisit
        } else if (attemptedQuestions.has(i)) {
            navItem.classList.add('attempted'); // Green for attempted
        } else if (visitedQuestions.has(i)) {
            navItem.classList.add('visited');   // Red for visited
        }
        // Questions not in visitedQuestions are default (gray)
        questionNavGridHeader.appendChild(navItem);
    }
}

/**
 * Starts the countdown timer.
 */
function startTimer() {
    clearInterval(timerInterval); // Clear any existing timer
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

/**
 * Submits the quiz, stops the timer, and displays the report.
 */
function submitQuiz() {
    clearInterval(timerInterval);
    displayReport();
    showPage('report-page');
}

/**
 * Displays the quiz report with user's answers vs. correct answers.
 */
function displayReport() {
    reportContent.innerHTML = ''; // Clear previous report content
    let score = 0;

    quizData.forEach((question, index) => {
        const userAnswerIndex = userAnswers[index];
        const userAnswer = userAnswerIndex !== null ? question.choices[userAnswerIndex] : 'Not Answered';
        const correctAnswer = question.correct_answer;

        const isCorrect = userAnswer === correctAnswer;
        if (isCorrect) {
            score++;
        }

        const questionReport = document.createElement('div');
        questionReport.classList.add('mb-6', 'p-4', 'rounded-lg', 'border', isCorrect ? 'border-green-300' : 'border-red-300', 'bg-white');
        questionReport.innerHTML = `
            <p class="font-semibold text-lg mb-2">${index + 1}. ${question.question}</p>
            <p class="text-gray-700 mb-1">Your Answer: <span class="${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium">${userAnswer}</span></p>
            <p class="text-gray-700">Correct Answer: <span class="text-green-600 font-medium">${correctAnswer}</span></p>
        `;
        reportContent.appendChild(questionReport);
    });

    const scoreDisplay = document.createElement('div');
    scoreDisplay.classList.add('text-center', 'text-2xl', 'font-bold', 'mt-8', 'mb-4', 'p-4', 'rounded-lg', 'bg-blue-100', 'text-blue-800');
    scoreDisplay.textContent = `You scored ${score} out of ${quizData.length} questions.`;
    reportContent.prepend(scoreDisplay); // Add score at the top of the report
}

/**
 * Resets the quiz to its initial state.
 */
function restartQuiz() {
    quizData = [];
    userAnswers = [];
    currentQuestionIndex = 0;
    timeLeft = 30 * 60;
    visitedQuestions.clear();
    attemptedQuestions.clear();
    revisitQuestions.clear(); // Clear revisit marks too
    userEmail = '';
    emailInput.value = '';
    timerDisplay.textContent = '30:00'; // Reset timer display
    
    // Clear question navigation circles (to make it like the second image)
    questionNavGridHeader.innerHTML = '';

    // Go back to the clean start page
    showPage('start-page');
}

// --- Event Listeners ---
window.onload = () => {
    showPage('start-page'); // Ensure start page is shown on load
};
continueBtn.addEventListener("click", () => {
    const userEmailInput = emailInput.value.trim();
    if (!userEmailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmailInput)) {
        emailError.classList.remove("hidden");
        return;
    }
    emailError.classList.add("hidden");
    userEmail = userEmailInput;

    // Only show Guidelines Page here
    showPage("guidelines-page");
});

// Start Quiz when user clicks "Start Assessment" on Guidelines Page
startQuizBtn.addEventListener('click', startQuiz);

nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
finishBtn.addEventListener('click', submitQuiz); // Event listener for the new Finish button
restartQuizBtn.addEventListener('click', restartQuiz);

// Revisit button logic
const revisitBtn = document.getElementById('revisit-btn');
revisitBtn.addEventListener('click', () => {
    if (revisitQuestions.has(currentQuestionIndex)) {
        revisitQuestions.delete(currentQuestionIndex); // Unmark if already marked
    } else {
        revisitQuestions.add(currentQuestionIndex); // Mark for revisit
    }
    updateNavigationPanel(); // Refresh navigation panel
});

// Event listener for the Guidelines button
if (guidelinesBtn) { // Check if the element exists
    guidelinesBtn.addEventListener('click', () => {
        showMessage('These are the quiz guidelines: Answer all 15 questions within 30 minutes. Your answers are saved automatically. You can navigate between questions using the Previous/Next buttons or by clicking the question numbers in the header. The quiz will auto-submit when the timer runs out.', 'success');
    });
}
