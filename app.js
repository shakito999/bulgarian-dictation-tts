const { useState, useEffect, useRef } = React;

function App() {
    const [text, setText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [punctuationMessage, setPunctuationMessage] = useState('');
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    
    // Customization settings
    const [speed, setSpeed] = useState(0.9);
    const [chunkSize, setChunkSize] = useState(3);
    const [commaPause, setCommaPause] = useState(500);
    const [periodPause, setPeriodPause] = useState(1000);
    const [newlinePause, setNewlinePause] = useState(800);
    const [chunkPause, setChunkPause] = useState(300);

    const speechRef = useRef(null);
    const chunksRef = useRef([]);
    const currentChunkIndexRef = useRef(0);

    useEffect(() => {
        // Load available voices
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            const bulgarianVoices = availableVoices.filter(voice => 
                voice.lang.includes('bg') || voice.lang.includes('BG')
            );
            setVoices(bulgarianVoices.length > 0 ? bulgarianVoices : availableVoices);
            if (bulgarianVoices.length > 0) {
                setSelectedVoice(bulgarianVoices[0].name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const splitIntoChunks = (text) => {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const chunks = [];
        
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        
        return chunks;
    };

    const speakPunctuation = async (punctuation) => {
        if (!punctuation) return;
        
        let message = '';
        switch (punctuation) {
            case ',':
                message = 'запетая';
                break;
            case '.':
                message = 'точка';
                break;
            case '!':
                message = 'удивителна';
                break;
            case '?':
                message = 'въпросителна';
                break;
            case '\n':
                message = 'нов ред';
                break;
            default:
                return;
        }

        setPunctuationMessage(message);
        
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'bg-BG';
            utterance.rate = speed;
            
            if (selectedVoice) {
                const voice = voices.find(v => v.name === selectedVoice);
                if (voice) utterance.voice = voice;
            }

            utterance.onend = () => {
                setTimeout(resolve, 200);
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    const speakChunk = async (chunk) => {
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(chunk);
            utterance.lang = 'bg-BG';
            utterance.rate = speed;
            
            if (selectedVoice) {
                const voice = voices.find(v => v.name === selectedVoice);
                if (voice) utterance.voice = voice;
            }

            utterance.onend = () => {
                setTimeout(resolve, chunkPause);
            };

            utterance.onerror = () => {
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    const pauseFor = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const startReading = async () => {
        if (!text.trim()) return;

        setIsPlaying(true);
        setIsPaused(false);
        chunksRef.current = splitIntoChunks(text);
        currentChunkIndexRef.current = 0;

        for (let i = 0; i < chunksRef.current.length; i++) {
            if (!isPlaying) break;
            
            while (isPaused) {
                await pauseFor(100);
                if (!isPlaying) break;
            }

            if (!isPlaying) break;

            currentChunkIndexRef.current = i;
            setCurrentWordIndex(i);
            
            const chunk = chunksRef.current[i];
            
            // Check for punctuation at the end of chunk
            const lastChar = chunk.slice(-1);
            if ([',', '.', '!', '?'].includes(lastChar)) {
                await speakChunk(chunk.slice(0, -1));
                await speakPunctuation(lastChar);
                
                // Add extra pause based on punctuation
                if (lastChar === ',') await pauseFor(commaPause);
                else if (lastChar === '.') await pauseFor(periodPause);
                else if (lastChar === '!' || lastChar === '?') await pauseFor(periodPause);
            } else {
                await speakChunk(chunk);
            }
        }

        setIsPlaying(false);
        setCurrentWordIndex(0);
        setPunctuationMessage('');
    };

    const pauseReading = () => {
        setIsPaused(!isPaused);
    };

    const stopReading = () => {
        setIsPlaying(false);
        setIsPaused(false);
        window.speechSynthesis.cancel();
        setCurrentWordIndex(0);
        setPunctuationMessage('');
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Българска Диктовка</h1>
                <p className="text-purple-300">TTS приложение с пунктуация и паузи</p>
            </div>

            {/* Text Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Въведете текст за диктовка..."
                    className="w-full h-48 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4 justify-center mb-6">
                <button
                    onClick={startReading}
                    disabled={!text.trim() || isPlaying}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                    {isPlaying ? 'Четене...' : 'Започни'}
                </button>
                <button
                    onClick={pauseReading}
                    disabled={!isPlaying}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                    {isPaused ? 'Продължи' : 'Пауза'}
                </button>
                <button
                    onClick={stopReading}
                    disabled={!isPlaying}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                    Спри
                </button>
            </div>

            {/* Current Status */}
            {isPlaying && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
                    <div className="text-center">
                        <p className="text-purple-300 mb-2">Текущ статус:</p>
                        {punctuationMessage && (
                            <p className="text-2xl font-bold text-yellow-400 punctuation-indicator mb-2">
                                {punctuationMessage}
                            </p>
                        )}
                        <p className="text-white text-lg">
                            Четене на част {currentChunkIndexRef.current + 1} от {chunksRef.current.length}
                        </p>
                    </div>
                </div>
            )}

            {/* Customization Panel */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Настройки</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Voice Selection */}
                    <div>
                        <label className="block text-purple-300 mb-2 font-medium">Глас:</label>
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {voices.map((voice, index) => (
                                <option key={index} value={voice.name} className="bg-slate-800">
                                    {voice.name} ({voice.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Speed */}
                    <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                            Скорост: {speed.toFixed(1)}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Chunk Size */}
                    <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                            Думи на част: {chunkSize}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={chunkSize}
                            onChange={(e) => setChunkSize(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Chunk Pause */}
                    <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                            Пауза между части: {chunkPause}ms
                        </label>
                        <input
                            type="range"
                            min="100"
                            max="1000"
                            step="50"
                            value={chunkPause}
                            onChange={(e) => setChunkPause(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Comma Pause */}
                    <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                            Пауза при запетая: {commaPause}ms
                        </label>
                        <input
                            type="range"
                            min="200"
                            max="1500"
                            step="50"
                            value={commaPause}
                            onChange={(e) => setCommaPause(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Period Pause */}
                    <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                            Пауза при точка: {periodPause}ms
                        </label>
                        <input
                            type="range"
                            min="500"
                            max="2000"
                            step="50"
                            value={periodPause}
                            onChange={(e) => setPeriodPause(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Newline Pause */}
                    <div>
                        <label className="block text-purple-300 mb-2 font-medium">
                            Пауза при нов ред: {newlinePause}ms
                        </label>
                        <input
                            type="range"
                            min="300"
                            max="1500"
                            step="50"
                            value={newlinePause}
                            onChange={(e) => setNewlinePause(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center text-purple-300/70 text-sm">
                <p>💡 Въведете текст на български и натиснете "Започни" за диктовка</p>
                <p className="mt-1">Приложението ще чете по части и ще обявява пунктуацията</p>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
