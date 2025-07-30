# Quiz Application

## Brief Overview

This is an interactive web-based Quiz Application designed to provide users with an engaging and straightforward way to test their knowledge. The application features a clean, responsive user interface and offers a timed quiz experience.

**Approach to the Problem:**
The primary goal was to create a simple yet effective quiz platform focusing on user experience and front-end development. The core idea was to manage quiz flow, display questions, handle user input, and present results in an intuitive manner.

**Components Built:**
* **Welcome/Login Screen:** An initial screen prompting users to enter their email to start the quiz. This serves as an entry point and can be extended for user authentication.
* **Quiz Interface:** Dynamically displays quiz questions and multiple-choice answers. It manages the current question state, user selections, and navigates between questions.
* **Timer:** A visible countdown timer to add a challenge element to the quiz, encouraging users to answer within a set timeframe.
* **Result Screen:** Shows the user's performance upon quiz completion, providing immediate feedback on their score.
* **Responsive Design:** Implemented using modern CSS techniques to ensure the application looks and functions well across various device sizes, from desktops to mobile phones.

## Setup and Installation Instructions

This is a front-end only application and requires no complex backend setup.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Saniyakhan04/quiz-application.git](https://github.com/Saniyakhan04/quiz-application.git)
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd quiz-application
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your preferred web browser. You can do this by double-clicking the file or by dragging it into your browser.

No specific dependencies or build tools are required for local development.

## Assumptions Made

* **Front-End Focus:** This application is primarily a front-end demonstration. Quiz questions are hardcoded within the JavaScript for simplicity and do not currently fetch from an external API or database.
* **Basic Email Input:** The email input on the welcome screen is for demonstration purposes only and does not perform any server-side validation or storage.
* **Single Quiz:** The application currently hosts a single set of quiz questions.
* **Client-Side Logic:** All quiz logic, including scoring and time management, is handled on the client-side (in JavaScript).

## Challenges Faced and How They Were Overcome

1.  **Responsive Design Implementation:**
    * **Challenge:** Ensuring the layout adapted smoothly to different screen sizes, especially the main quiz card and form elements, without compromising usability.
    * **Overcoming:** Utilized CSS Flexbox and Grid for flexible layouts. Employed relative units (like percentages and `vw`/`vh`) for sizing and implemented media queries to adjust styling at specific breakpoints, ensuring optimal viewing on mobile and desktop.

2.  **Managing Quiz State and Flow:**
    * **Challenge:** Effectively managing which question is currently displayed, handling user selections, tracking the score, and transitioning between questions and the results screen purely with JavaScript.
    * **Overcoming:** Developed clear JavaScript functions for `loadQuestion()`, `selectAnswer()`, `nextQuestion()`, and `showResults()`. Maintained a `currentQuestionIndex` and `score` variable to keep track of the quiz state, making the flow logical and maintainable.

3.  **Implementing a Reliable Timer:**
    * **Challenge:** Creating a countdown timer that updates accurately and handles quiz submission when time runs out.
    * **Overcoming:** Used `setInterval()` in JavaScript to decrement the time every second. Implemented logic to clear the interval and automatically submit the quiz or show an "out of time" message when the timer reaches zero, ensuring a consistent user experience.
