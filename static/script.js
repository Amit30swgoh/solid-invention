document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const transcriptDiv = document.getElementById('transcript');
    let wordData = [];

    audioPlayer.src = '/static/audio.opus';

    function checkModelStatus(callback) {
        fetch('/status')
            .then(response => response.json())
            .then(data => {
                if (data.model_loaded) {
                    callback();
                } else {
                    setTimeout(() => checkModelStatus(callback), 1000); // Check again after 1 second
                }
            })
            .catch(error => console.error('Error checking model status:', error));
    }

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

                wordData.forEach(word => {
                    const wordSpan = document.createElement('span');
                    wordSpan.textContent = word.word + ' ';
                    wordSpan.dataset.startTime = word.start;
                    wordSpan.dataset.endTime = word.end;
                    transcriptDiv.appendChild(wordSpan);
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

    checkModelStatus(() => {
        fetchTranscript();
    });
});
