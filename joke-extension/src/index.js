import axios from 'axios';

const setupElement = document.getElementById('joke-setup');
const punchlineElement = document.getElementById('joke-punchline');
const newJokeBtn = document.getElementById('new-joke-btn');
const loadingText = document.querySelector('.loading');

async function fetchJoke() {
    try {
        setupElement.style.display = 'none';
        punchlineElement.style.display = 'none';
        loadingText.style.display = 'block';
        newJokeBtn.disabled = true;

        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        
        const setup = response.data.setup;
        const punchline = response.data.punchline;

        loadingText.style.display = 'none';
        
        setupElement.textContent = setup;
        setupElement.style.display = 'block';

        setTimeout(() => {
            punchlineElement.textContent = punchline;
            punchlineElement.style.display = 'block';
            newJokeBtn.disabled = false;
        }, 1500);

    } catch (error) {
        console.error(error);
        loadingText.style.display = 'none';
        setupElement.style.display = 'block';
        setupElement.textContent = 'Oops! Failed to fetch a joke.';
        newJokeBtn.disabled = false;
    }
}

newJokeBtn.addEventListener('click', fetchJoke);
fetchJoke(); 