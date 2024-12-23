document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const transcriptDiv = document.getElementById('transcript');
    let wordData = [];

    audioPlayer.src = '/static/audio.opus';

    function fetchTranscript() {
        fetch('/process', { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.error) {
                    throw new Error(result.error);
                }

                wordData = result.word_data;
                transcriptDiv.innerHTML = result.transcript_html;

                // Add event listeners to spans that have timing data
                transcriptDiv.querySelectorAll('span[data-start-time]').forEach(span => {
                    span.addEventListener('click', () => {
                        const startTime = parseFloat(span.dataset.startTime);
                        if (!isNaN(startTime)) {
                            audioPlayer.currentTime = startTime;
                            audioPlayer.play();
                        }
                    });
                });

                audioPlayer.addEventListener('timeupdate', highlightWords);
            })
            .catch(error => {
                console.error('Error fetching transcript:', error);
                transcriptDiv.textContent = 'Error fetching transcript: ' + error.message;
            });
    }

    function highlightWords() {
        const currentTime = audioPlayer.currentTime;

        transcriptDiv.querySelectorAll('span[data-start-time]').forEach(span => {
            const startTime = parseFloat(span.dataset.startTime);
            const endTime = parseFloat(span.dataset.endTime);

            if (!isNaN(startTime) && !isNaN(endTime) && currentTime >= startTime && currentTime <= endTime) {
                span.classList.add('highlight');
            } else {
                span.classList.remove('highlight');
            }
        });
    }

    // Call fetchTranscript to load the transcript data
    fetchTranscript();
    createBackgroundAnimation();
});

function createBackgroundAnimation() {
    const numDots = 50;
    const animationContainer = document.getElementById('background-animation');

    for (let i = 0; i < numDots; i++) {
        createDot(animationContainer);
    }
}

function createDot(container) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    container.appendChild(dot);

    const size = Math.random() * 10 + 5; // Random size between 5 and 15px
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    // Set initial position and size
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;

    // Animate the dot
    anime({
        targets: dot,
        translateX: () => anime.random(-window.innerWidth / 2, window.innerWidth / 2),
        translateY: () => anime.random(-window.innerHeight / 2, window.innerHeight / 2),
        scale: () => anime.random(1, 2),
        opacity: [0, 0.5, 0],
        easing: 'easeInOutQuad',
        duration: anime.random(3000, 6000),
        loop: true,
        direction: 'alternate'
    });
}
