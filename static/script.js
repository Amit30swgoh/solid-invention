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
                transcriptDiv.innerHTML = result.transcript_html; // Set the HTML content

                // Wrap each word in a span with timing data
                let formattedTranscript = '';
                let charIndex = 0;
                wordData.forEach(word => {
                    const wordText = word.word;
                    const startIndex = result.transcript_html.indexOf(wordText, charIndex);
                    if (startIndex !== -1) {
                        const preText = result.transcript_html.substring(charIndex, startIndex);
                        formattedTranscript += preText;
                        formattedTranscript += `<span data-start-time="${word.start}" data-end-time="${word.end}">${wordText}</span>`;
                        charIndex = startIndex + wordText.length;
                    }
                });
                formattedTranscript += result.transcript_html.substring(charIndex);
                transcriptDiv.innerHTML = formattedTranscript;

                // Add event listener for highlighting
                transcriptDiv.querySelectorAll('span').forEach(span => {
                    span.addEventListener('click', () => {
                        audioPlayer.currentTime = parseFloat(span.dataset.startTime);
                        audioPlayer.play();
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
        const spans = transcriptDiv.querySelectorAll('span');

        spans.forEach(span => {
            const startTime = parseFloat(span.dataset.startTime);
            const endTime = parseFloat(span.dataset.endTime);

            if (currentTime >= startTime && currentTime <= endTime) {
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
