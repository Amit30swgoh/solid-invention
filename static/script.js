document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audioFile');
    const audioPlayer = document.getElementById('audioPlayer');
    const transcriptDiv = document.getElementById('transcript');
    let audioURL = null; // Store the audio URL globally
    let wordData = []; // Store the word data globally

    audioFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Clear previous transcript and reset audio player
            transcriptDiv.innerHTML = '';
            audioPlayer.src = '';

            try {
                const formData = new FormData();
                formData.append('audioFile', file);

                const response = await fetch('/process', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.error);
                }

                wordData = result.word_data;
                audioURL = result.audio_url;

                // Update audio player source
                audioPlayer.src = audioURL;

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
                console.error('Error processing audio:', error);
                transcriptDiv.textContent = 'Error processing audio: ' + error.message;
            }
        }
    });

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
});