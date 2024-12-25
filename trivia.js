const playButton = document.querySelector('#play');
let player1 = document.querySelector('#player1');
let player2 = document.querySelector('#player2');

let validCategories = []


let scores = {
    player1: 0,
    player2: 0
}

// displaying categories by making play button dynamic
playButton.addEventListener('click', async (event) => {
    try {
        player1 = player1.value;
        player2 = player2.value;

        if (player1 && player2) {
            document.querySelector('main > h1').style.display = 'none';
            document.querySelector('.user-entry').style.display = 'none';

            const response = await fetch('https://the-trivia-api.com/v2/questions');
            const data = await response.json();
            const categoriesArray = data.map(obj => obj.category);

            categoriesArray.forEach(category => {
                if (!validCategories.includes(category)){
                    validCategories.push(category);
                }
            })
            

            displayCategories();
        }
        else {
            alert('Enter user names!')
        }
    }
    catch (err) {
        console.log('cought an error', err)
    }
})





async function displayCategories() {
    let categoriesSection = document.querySelector('#categories-section');
    categoriesSection.style.display = 'block';
    categoriesSection.innerHTML = '';
    const heading = document.createElement('h1');
    heading.innerText = 'Select Categories';
    categoriesSection.append(heading);

    console.log(validCategories);
    
    validCategories.forEach((key) => {
        const categoryButton = document.createElement('button');
        categoryButton.className = 'category-item';
        categoryButton.textContent = key;
        categoriesSection.append(categoryButton);


        categoryButton.addEventListener('click', async () => {
            categoriesSection.style.display = 'none';
            clickedCategory = key;
            console.log(key);
            validCategories = validCategories.filter((category) => category !== key)
            // console.log(clickedCategory)
            try {
                const data = await fetchQuestions(clickedCategory)
                //    console.log(data);
                displayQuestions(data.player1, data.player2);
            } catch (error) {

            }
        })
    })
    console.log(validCategories.length);
}





async function fetchQuestionsWithCategoryAndDifficulty(category, difficulty) {
    try {
        const response = await fetch(`https://the-trivia-api.com/api/questions?categories=${category}&difficulty=${difficulty}&limit=2`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("failed to fetch questions:", error);
    }
}




async function fetchQuestions(clickedCategory) {
    const easyQuestions = await fetchQuestionsWithCategoryAndDifficulty(clickedCategory, 'easy');
    if (easyQuestions.length < 2) {
        throw new Error("Please choose different category.!");
    }

    const mediumQuestions = await fetchQuestionsWithCategoryAndDifficulty(clickedCategory, 'medium');
    if (mediumQuestions.length < 2) {
        throw new Error("Please choose different category.!");
    }

    const hardQuestions = await fetchQuestionsWithCategoryAndDifficulty(clickedCategory, 'hard');
    if (easyQuestions.length < 2) {
        throw new Error("Please choose different category.!");
    }

    const player1Questions = [easyQuestions[0], mediumQuestions[0], hardQuestions[0]];
    const player2Questions = [easyQuestions[1], mediumQuestions[1], hardQuestions[1]];

    return {
        player1: player1Questions,
        player2: player2Questions
    }
}



// function to display questions
function displayQuestions(p1Questions, p2Questions) {
    
    currentPlayer = player1;
    p1QuestionsIndex = 0;
    p2QuestionsIndex = 0;
    console.log(player1, (p1Questions));
    console.log(player2, (p2Questions));
    const questionsOptionsArea = document.querySelector('.question-options-area');
    questionsOptionsArea.style.display = "flex";

    renderQuestion();


    function renderQuestion() {
        questionsOptionsArea.innerHTML = '';

        if (currentPlayer === player1 && p1QuestionsIndex < p1Questions.length) {
            console.log((currentPlayer), p1QuestionsIndex);
            console.log(p1Questions[p1QuestionsIndex].question);

            const question = p1Questions[p1QuestionsIndex].question;
            const questionArea = document.createElement('p');
            questionArea.innerHTML = `<i>${currentPlayer}</i> : ${question}`
            questionsOptionsArea.append(questionArea);


            displayOptions(p1QuestionsIndex, p1Questions, () => {
                p1QuestionsIndex++;
                currentPlayer = player2;
                renderQuestion();
            })
        }
        else if (currentPlayer === player2 && p2QuestionsIndex < p2Questions.length) {
            console.log(currentPlayer, p2QuestionsIndex);
            console.log(p2Questions[p2QuestionsIndex].question);

            const question = p2Questions[p2QuestionsIndex].question;
            const questionArea = document.createElement('p');
            questionArea.innerHTML = `<i>${currentPlayer}</i> : ${question}`
            questionsOptionsArea.append(questionArea);

            displayOptions(p2QuestionsIndex, p2Questions, () => {
                p2QuestionsIndex++;
                currentPlayer = player1;
                renderQuestion();
            });
        }
        else {
            const replayQuitSection = document.getElementById('replay-quit');
            questionsOptionsArea.style.display = 'none';
            replayQuitSection.style.display = 'block'
            // console.log(scores);

            const replayBtn = document.getElementById('replay');
            const quitBtn = document.getElementById('quit');

            replayBtn.addEventListener('click', () => {
                replayQuitSection.style.display = 'none';
                displayCategories();
            })

            quitBtn.addEventListener('click', () => {
                replayQuitSection.style.display = 'none'
                scoreAnnouncement(scores);
            })
        }
    }



    function displayOptions(index, array, nextQuestion) {
        const correctOption = array[index].correctAnswer;
        let allOptions = array[index].incorrectAnswers;
        allOptions.push(array[index].correctAnswer);

        for (let i = allOptions.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i));
            let temp = allOptions[j];
            allOptions[j] = allOptions[i];
            allOptions[i] = temp;
        }
        console.log(allOptions);
        const optionsArea = document.createElement('ul');

        allOptions.forEach(option => {
            let optionTag = document.createElement('li');
            optionTag.innerText = option;
            optionsArea.append(optionTag);
            optionTag.addEventListener('click', () => {
                selectedOption = option;
                validateAnswer(selectedOption, correctOption, index)
                nextQuestion()
            })
        })
        questionsOptionsArea.append(optionsArea);
    }


    function validateAnswer(selectedOption, correctOption, index) {
        if (selectedOption === correctOption) {
            if (currentPlayer === player1) {
                scores.player1 += updateScore(index)
            } else {
                scores.player2 += updateScore(index)
            }
        }
        else {
            alert('Wrong Answer.!!')
        }
    } 
}






function updateScore(index) {
    if (index === 0) {
        return 10;
    }
    else if (index === 1) {
        return 15;
    }
    else if (index === 2) {
        return 25;
    }
}




function scoreAnnouncement(scoresObj) {
    const player1Score = document.getElementById('player1-score');
    const player2Score = document.getElementById('player2-score');
    const winnerEle = document.getElementById('winner');

    player1Score.innerHTML = `${player1}'s Score is : ${scoresObj.player1}`;
    player2Score.innerHTML = `${player2}'s Score is : ${scoresObj.player2}`;

    if (scoresObj.player1 === scoresObj.player2) {
        winnerEle.innerHTML = 'Game Draw..!'
    }
    else if (scoresObj.player1 > scoresObj.player2) {
        winnerEle.innerHTML = `${player1} is Winner...!!`
        player1Score.className = 'winner';
        player2Score.className = 'looser'
    }
    else {
        winnerEle.innerHTML = `${player2} is Winner...!!`
        player2Score.className = 'winner';
        player1Score.className = 'looser'
    }
}











