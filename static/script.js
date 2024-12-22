document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const transcriptDiv = document.getElementById('transcript');
    let wordData = []; // Store the word data globally

    // Set the audio source to the static file
    audioPlayer.src = '/static/audio.opus';

    async function fetchTranscript() {
        try {
            const response = await fetch('/process', { method: 'POST' }); // Make a POST request to /process

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            wordData = result.word_data; // Update the global wordData

            // Populate the transcript
            wordData.forEach(word => {
                const wordSpan = document.createElement('span');
                wordSpan.textContent = word.word + ' ';
                wordSpan.dataset.startTime = word.start;
                wordSpan.dataset.endTime = word.end;
                transcriptDiv.appendChild(wordSpan);
            });

            // Add event listener for highlighting
            audioPlayer.addEventListener('timeupdate', highlightWords);

        } catch (error) {
            console.error('Error fetching transcript:', error);
            transcriptDiv.textContent = 'Error fetching transcript: ' + error.message;
        }
    }

    function highlightWords() {
        const currentTime = audioPlayer.currentTime;
        const words = transcriptDiv.querySelectorAll('span');

        words.forEach(word => {
            const startTime = parseFloat(word.dataset.startTime);
            const endTime = parseFloat(word.dataset.endTime);

            if (currentTime >= startTime && currentTime <= endTime) {
                word.classList.add('highlight');
            } else {
                word.classList.remove('highlight');
            }
        });
    }

    // Call fetchTranscript to load the transcript data
    fetchTranscript();
});
