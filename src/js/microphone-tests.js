// Microphone Testing Functions for Azure AI Avatar

// =================== MICROPHONE TEST FUNCTION ===================
async function testMicrophone() {
    try {
        console.log('🧪 Testing microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone access granted, stream:', stream);
        
        // Test creating a simple speech recognizer without avatar
        const apiKey = document.getElementById('APIKey').value.trim();
        const region = document.getElementById('region').value.trim();
        
        if (!apiKey) {
            alert('Please enter your Azure Speech API key first');
            return;
        }
        
        console.log('🔧 Creating test speech config...');
        const testConfig = SpeechSDK.SpeechConfig.fromSubscription(apiKey, region);
        testConfig.speechRecognitionLanguage = 'en-US';
        
        console.log('🎤 Creating test speech recognizer...');
        const testRecognizer = new SpeechSDK.SpeechRecognizer(
            testConfig,
            SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()
        );
        
        console.log('✅ Test speech recognizer created successfully');
        
        testRecognizer.recognizing = (s, e) => {
            console.log('🎤 TEST RECOGNIZING: ' + e.result.text);
        };
        
        testRecognizer.recognized = (s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                console.log('✅ TEST RECOGNITION SUCCESS:', e.result.text);
                alert('🎉 Microphone test successful! Recognized: "' + e.result.text + '"');
            } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
                console.log('❌ TEST NO MATCH: Speech could not be recognized');
                alert('❌ No speech recognized. Try speaking louder or closer to the microphone.');
            }
            testRecognizer.close();
        };
        
        testRecognizer.canceled = (s, e) => {
            console.log('🚫 TEST RECOGNITION CANCELED:', e.reason, e.errorDetails);
            if (e.reason === SpeechSDK.CancellationReason.Error) {
                alert('❌ Test failed: ' + e.errorDetails);
            }
            testRecognizer.close();
        };
        
        console.log('🎬 Starting test recognition... Please speak now!');
        alert('🎤 Test starting! Please speak clearly after clicking OK.');
        
        testRecognizer.recognizeOnceAsync(
            result => {
                console.log('🏁 Test recognition completed:', result.reason);
            },
            error => {
                console.error('❌ Test recognition error:', error);
                alert('❌ Microphone test failed: ' + error);
                testRecognizer.close();
            }
        );
        
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
        
    } catch (err) {
        console.error('❌ Microphone test failed:', err);
        alert('❌ Microphone test failed: ' + err.message);
    }
}

// =================== AUDIO LEVEL DETECTION ===================
async function testAudioLevels() {
    try {
        console.log('🎵 Testing audio levels...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
        microphone.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let maxLevel = 0;
        let samples = 0;
        const testDuration = 3000; // 3 seconds
        
        console.log('🎤 Speak now! Testing for 3 seconds...');
        alert('🎤 Audio level test starting! Please speak loudly for 3 seconds after clicking OK.');
        
        const interval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            maxLevel = Math.max(maxLevel, average);
            samples++;
            
            if (average > 10) {
                console.log('🔊 Audio detected! Level:', Math.round(average));
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(interval);
            stream.getTracks().forEach(track => track.stop());
            audioContext.close();
            
            console.log('📊 Audio test complete. Max level:', Math.round(maxLevel));
            if (maxLevel > 20) {
                alert('✅ Audio test PASSED! Max level: ' + Math.round(maxLevel) + '. Your microphone is working.');
            } else {
                alert('❌ Audio test FAILED! Max level: ' + Math.round(maxLevel) + '. Check your microphone settings.');
            }
        }, testDuration);
        
    } catch (err) {
        console.error('❌ Audio level test failed:', err);
        alert('❌ Audio level test failed: ' + err.message);
    }
}

// =================== BROWSER PERMISSION CHECKS ===================
async function checkMicrophonePermissions() {
    try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
        // Stop the stream since we're just checking permissions
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (err) {
        console.error('Microphone permission denied or unavailable:', err);
        alert('Microphone access is required for speech recognition. Please allow microphone access and try again.');
        return false;
    }
}
