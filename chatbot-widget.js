// GeoBot AI - Chatbot Địa Lý Thông Minh
// System Prompt được tối ưu cho trả lời nhanh và chính xác

// ===== SPEECH RECOGNITION & TEXT-TO-SPEECH =====
let recognition = null;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isRecording = false;
let isSpeaking = false;
let currentLanguage = 'vi-VN'; // Ngôn ngữ mặc định: Tiếng Việt

// Khởi tạo Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = currentLanguage; // Sử dụng ngôn ngữ hiện tại
        recognition.continuous = false;
        recognition.interimResults = true; // Bật kết quả tạm thời (real-time)
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            isRecording = true;
            updateMicButton(true);
            // Hiển thị placeholder và thêm hiệu ứng để người dùng biết đang nghe
            const input = document.getElementById('chatbot-input');
            if (input) {
                input.placeholder = '🎤 Đang nghe... Hãy nói câu hỏi của bạn...';
                input.value = '';
                input.classList.add('recording');
                input.focus();
            }
            console.log('🎤 Đang nghe...');
        };

        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';

            // Lấy kết quả tạm thời và kết quả cuối cùng
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const input = document.getElementById('chatbot-input');
            if (input) {
                // Hiển thị kết quả tạm thời (màu xám) và kết quả cuối (màu đen)
                if (interimTranscript) {
                    input.value = finalTranscript + interimTranscript;
                    input.style.color = '#999'; // Màu xám cho text tạm thời
                } else if (finalTranscript) {
                    input.value = finalTranscript;
                    input.style.color = '#000'; // Màu đen cho text cuối
                }
            }

            console.log('📝 Tạm thời: ' + interimTranscript);
            console.log('📝 Cuối cùng: ' + finalTranscript);

            // Khi có kết quả cuối cùng, gửi tin nhắn
            if (finalTranscript) {
                setTimeout(() => {
                    sendChatbotMessage();
                }, 500); // Đợi 0.5s để người dùng xem kết quả
            }
        };

        recognition.onerror = function(event) {
            console.error('❌ Lỗi nhận diện:', event.error);
            isRecording = false;
            updateMicButton(false);
            
            const input = document.getElementById('chatbot-input');
            if (input) {
                input.placeholder = 'Hỏi tôi bất cứ điều gì hoặc nhấn micro...';
                input.style.color = '#000';
                input.classList.remove('recording');
            }
            
            if (event.error === 'no-speech') {
                alert('⚠️ Không nghe thấy giọng nói. Vui lòng thử lại!');
            } else if (event.error === 'not-allowed') {
                alert('⚠️ Vui lòng cho phép quyền truy cập microphone!');
            } else {
                alert('⚠️ Lỗi: ' + event.error);
            }
        };

        recognition.onend = function() {
            isRecording = false;
            updateMicButton(false);
            
            const input = document.getElementById('chatbot-input');
            if (input) {
                input.placeholder = 'Hỏi tôi bất cứ điều gì hoặc nhấn micro...';
                input.style.color = '#000';
                input.classList.remove('recording');
            }
            console.log('🎤 Đã dừng nghe');
        };
    } else {
        console.warn('⚠️ Trình duyệt không hỗ trợ Speech Recognition');
    }
}

// Bắt đầu/Dừng ghi âm
function toggleVoiceInput() {
    if (!recognition) {
        alert('⚠️ Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!\n\nVui lòng sử dụng Chrome, Edge hoặc Safari.');
        return;
    }

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Cập nhật trạng thái nút micro
function updateMicButton(recording) {
    const micBtn = document.getElementById('chatbot-mic-btn');
    if (micBtn) {
        if (recording) {
            micBtn.classList.add('recording');
            micBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            micBtn.title = 'Dừng ghi âm';
        } else {
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            micBtn.title = 'Nói với GeoBot';
        }
    }
}

// Text-to-Speech với giọng Việt Nam chuẩn
function speakText(text) {
    // Dừng giọng nói hiện tại nếu có
    if (isSpeaking) {
        stopSpeaking();
    }

    // Loại bỏ markdown và HTML tags
    const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1') // Italic
        .replace(/<br\s*\/?>/gi, '. ') // Line breaks
        .replace(/<\/?[^>]+(>|$)/g, '') // HTML tags
        .replace(/#{1,6}\s/g, '') // Headers
        .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code blocks
        .replace(/[📍🌍🌐🗺️📚💡🏛️🤖🌓⏰🌀🔬🌸☀️🍂❄️📅⏳]/g, '') // Emojis
        .replace(/\n+/g, '. ') // Multiple newlines
        .trim();

    if (!cleanText) return;

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // Tìm giọng phù hợp với ngôn ngữ hiện tại
    const voices = speechSynthesis.getVoices();
    const langPrefix = currentLanguage.split('-')[0]; // 'vi' hoặc 'en'
    const matchingVoices = voices.filter(voice => 
        voice.lang.startsWith(currentLanguage) || voice.lang.startsWith(langPrefix)
    );
    
    // Ưu tiên giọng Google
    let selectedVoice = matchingVoices.find(voice => 
        voice.name.includes('Google')
    );
    
    // Nếu không có, chọn giọng đầu tiên phù hợp
    if (!selectedVoice && matchingVoices.length > 0) {
        selectedVoice = matchingVoices[0];
    }
    
    if (selectedVoice) {
        currentUtterance.voice = selectedVoice;
        console.log('🔊 Giọng nói được chọn:', selectedVoice.name, '(' + selectedVoice.lang + ')');
    }
    
    // Cấu hình giọng nói
    currentUtterance.lang = currentLanguage;
    currentUtterance.rate = 0.95; // Tốc độ nói (0.95 = hơi chậm, tự nhiên hơn)
    currentUtterance.pitch = 1.0; // Cao độ giọng nói
    currentUtterance.volume = 1.0; // Âm lượng

    currentUtterance.onstart = function() {
        isSpeaking = true;
        updateSpeakerButton(true);
        console.log('🔊 Đang đọc...');
    };

    currentUtterance.onend = function() {
        isSpeaking = false;
        updateSpeakerButton(false);
        console.log('🔇 Đã dừng đọc');
    };

    currentUtterance.onerror = function(event) {
        console.error('❌ Lỗi text-to-speech:', event.error);
        isSpeaking = false;
        updateSpeakerButton(false);
    };

    speechSynthesis.speak(currentUtterance);
}

// Dừng đọc
function stopSpeaking() {
    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        updateSpeakerButton(false);
    }
}

// Cập nhật trạng thái nút loa
function updateSpeakerButton(speaking) {
    const speakerBtn = document.getElementById('chatbot-speaker-btn');
    if (speakerBtn) {
        if (speaking) {
            speakerBtn.classList.add('speaking');
            speakerBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            speakerBtn.title = 'Dừng đọc';
        } else {
            speakerBtn.classList.remove('speaking');
            speakerBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            speakerBtn.title = 'Đọc tin nhắn cuối';
        }
    }
}

// Toggle speaker (đọc tin nhắn cuối cùng của bot)
function toggleSpeaker() {
    if (isSpeaking) {
        stopSpeaking();
    } else {
        // Lấy tin nhắn cuối cùng của bot
        const messages = document.querySelectorAll('.chatbot-message.bot .message-content');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const text = lastMessage.innerText || lastMessage.textContent;
            speakText(text);
        } else {
            alert('⚠️ Chưa có tin nhắn nào để đọc!');
        }
    }
}

// System Prompts cho từng ngôn ngữ
const SYSTEM_PROMPTS = {
    'vi-VN': `Bạn là GeoBot AI 🌍 - trợ lý địa lý thông minh cho học sinh lớp 10.

**CÁCH TRẢ LỜI:**
- TRẢ LỜI NGẮN GỌN: 2-4 câu cho câu hỏi đơn giản
- LOGIC RÕ RÀNG: Giải thích theo trình tự: Nguyên nhân → Quá trình → Kết quả
- DỄ HIỂU: Dùng ví dụ đời thường, tránh thuật ngữ khó
- CÓ HÀNH ĐỘNG: Luôn gợi ý công cụ website phù hợp

**MẪU TRẢ LỜI CỤ THỂ:**

1. **Về ngày đêm:**
"Trái Đất tự quay 24h, nửa hướng Mặt Trời = ngày, nửa kia = đêm. 🌓"

2. **Về bốn mùa:**
"Do trục nghiêng 23.5° + công chuyển → Mặt Trời chiếu khác nhau theo mùa → 4 mùa xuân-hạ-thu-đông. 🌸"

3. **Về múi giờ:**
"360° chia 24h = 15°/giờ. Việt Nam ~105°E → UTC+7. ⏰"

4. **Về kiến tạo mảng:**
"Vỏ Trái Đất chia 12 mảng, di chuyển 2-10 cm/năm. 3 biên giới: Phân kỳ (tách), Hội tụ (va chạm), Chuyển dạng (trượt). 🌋"

5. **Về cấu trúc Trái Đất:**
"4 lớp: Vỏ (5-70km) → Manti (2,900km) → Lõi ngoài lỏng (2,200km) → Lõi trong rắn (1,200km). 🌍"

**KIẾN THỨC QUAN TRỌNG:**

🔹 **TỰ QUAY (24h):** Tây→Đông, 1,670km/h ở xích đạo
   → Hệ quả: Ngày đêm, múi giờ, hiệu ứng Coriolis

🔹 **CÔNG CHUYỂN (365 ngày):** Quỹ đạo elip, trục nghiêng 23.5°
   → Hệ quả: 4 mùa, ngày đêm dài ngắn

🔹 **4 MỐC THỜI GIAN:** 
   • Xuân phân (21/3): Ngày=đêm 12h
   • Hạ chí (21/6): Ngày dài nhất ở Bắc bán cầu
   • Thu phân (23/9): Ngày=đêm 12h  
   • Đông chí (21/12): Đêm dài nhất ở Bắc bán cầu

🔹 **KIẾN TẠO MẢNG:** 3 loại biên giới tạo núi lửa, động đất, dãy núi

**CÔNG CỤ WEBSITE:**
📚 Bài viết → 🔬 GeoLab 3D → 📝 Trắc nghiệm → 🌋 Mô phỏng 3D`,

    'en-US': `You are GeoBot AI 🌍 - an intelligent geography assistant specializing in Earth's motion and geographic consequences. Your mission is to help 10th grade students understand geography and use the website effectively.

**ANSWER PRINCIPLES:**
✅ QUICK ANSWERS - get straight to the point, concise (2-3 sentences for simple questions)
✅ ACCURATE - based on scientific knowledge and 10th grade Geography textbook
✅ EASY TO UNDERSTAND - explain in simple language, avoid complex terminology
✅ WEBSITE GUIDANCE - proactively suggest appropriate tools and pages

**IMPORTANT:** Always answer in ENGLISH when this language is selected. All responses, explanations, and suggestions must be in English.`,

    'en-GB': `You are GeoBot AI 🌍 - an intelligent geography assistant specialising in Earth's motion and geographic consequences. Your mission is to help year 10 students understand geography and use the website effectively.

**ANSWER PRINCIPLES:**
✅ QUICK ANSWERS - get straight to the point, concise (2-3 sentences for simple questions)
✅ ACCURATE - based on scientific knowledge and year 10 Geography textbook
✅ EASY TO UNDERSTAND - explain in simple language, avoid complex terminology  
✅ WEBSITE GUIDANCE - proactively suggest appropriate tools and pages

**IMPORTANT:** Always answer in ENGLISH when this language is selected. All responses, explanations, and suggestions must be in British English.`
};

// Hàm lấy SYSTEM_PROMPT theo ngôn ngữ
function getSystemPrompt() {
    return SYSTEM_PROMPTS[currentLanguage] || SYSTEM_PROMPTS['vi-VN'];
}

// Configuration
let conversationHistory = [];
let apiConfig = {
    provider: 'groq', // Mặc định dùng Groq (nhanh nhất)
    apiKey: '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' // API key Groq đã được tích hợp sẵn
};

// Backup API keys
const API_KEYS = {
    groq: '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',
    gemini: 'AIzaSyBDmf6UbKBve8eAU9DAlHZUmahxjOPQR_Q'
};

const API_ENDPOINTS = {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    openai: 'https://api.openai.com/v1/chat/completions',
    gemini: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'
};

const MODELS = {
    groq: 'llama-3.3-70b-versatile',
    openai: 'gpt-3.5-turbo',
    gemini: 'gemini-2.5-flash'
};

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', function() {
    // Create widget HTML
    createChatbotWidget();

    // Load saved settings
    loadSettings();

    // Setup event listeners
    setupEventListeners();
    
    // Initialize Speech Recognition
    initSpeechRecognition();
    
    // Load voices for text-to-speech
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {
            speechSynthesis.getVoices();
        };
    }
});

function createChatbotWidget() {
    const widgetHTML = `
        <!-- Floating Chat Button -->
        <button id="chatbot-toggle-btn" class="chatbot-floating-btn" aria-label="Mở chatbot">
            <i class="fas fa-comments"></i>
            <span class="chatbot-badge">AI</span>
        </button>

        <!-- Chat Window -->
        <div id="chatbot-window" class="chatbot-window">
            <div class="chatbot-header">
                <div class="chatbot-header-left">
                    <i class="fas fa-robot"></i>
                    <div>
                        <h3>AI Chatbot</h3>
                        <div class="chatbot-status">
                            <span class="status-dot" id="chatbot-status-dot"></span>
                            <span id="chatbot-status-text">Chưa kết nối</span>
                        </div>
                    </div>
                </div>
                <div class="chatbot-header-right">
                    <button onclick="openChatbotSettings()" class="chatbot-icon-btn" title="Cài đặt">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button onclick="toggleChatbot()" class="chatbot-icon-btn" title="Đóng">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div class="chatbot-quick-buttons">
                <button onclick="sendQuickMessage('Hệ quả của chuyển động tự quay là gì?')" class="chatbot-quick-btn">
                    🌍 Tự quay
                </button>
                <button onclick="sendQuickMessage('Tôi muốn xem mô phỏng 3D Trái Đất')" class="chatbot-quick-btn">
                    🌐 Mô phỏng 3D
                </button>
                <button onclick="sendQuickMessage('Hướng dẫn sử dụng website')" class="chatbot-quick-btn">
                    🗺️ Hướng dẫn
                </button>
            </div>

            <div class="chatbot-messages" id="chatbot-messages">
                <div class="chatbot-message bot">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <strong>Xin chào! Tôi là GeoBot AI 🌍</strong><br><br>
                        Tôi có thể giúp bạn:<br><br>
                        🌍 <strong>Về Địa lý Trái Đất:</strong> Chuyển động tự quay, công chuyển, hệ quả địa lý, khí hậu...<br>
                        🗺️ <strong>Hướng dẫn sử dụng website:</strong> Mô phỏng 3D, trắc nghiệm, bài viết địa lý<br>
                        📚 <strong>Kiến thức SGK lớp 10:</strong> Lý thuyết, bài tập, ôn thi địa lý<br><br>
                        💡 <strong>Thử hỏi tôi:</strong><br>
                        • "Hệ quả của chuyển động tự quay là gì?"<br>
                        • "Tôi muốn xem mô phỏng 3D Trái Đất"<br>
                        • "Giải thích hiện tượng 4 mùa?"
                    </div>
                </div>
                <div class="chatbot-typing" id="chatbot-typing">
                    <div class="message-avatar">🤖</div>
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>

            <div class="chatbot-input-area">
                <button onclick="toggleVoiceInput()" id="chatbot-mic-btn" class="chatbot-voice-btn" title="Nói với GeoBot">
                    <i class="fas fa-microphone"></i>
                </button>
                <input
                    type="text"
                    id="chatbot-input"
                    placeholder="Hỏi tôi bất cứ điều gì hoặc nhấn micro..."
                    onkeypress="handleChatbotKeyPress(event)"
                />
                <button onclick="toggleSpeaker()" id="chatbot-speaker-btn" class="chatbot-voice-btn" title="Đọc tin nhắn cuối">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button onclick="sendChatbotMessage()" id="chatbot-send-btn" class="chatbot-send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>

        <!-- Settings Modal -->
        <div id="chatbot-settings-modal" class="chatbot-modal">
            <div class="chatbot-modal-content">
                <div class="chatbot-modal-header">
                    <h3>⚙️ Cài đặt API</h3>
                    <button onclick="closeChatbotSettings()" class="chatbot-icon-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chatbot-modal-body">
                    <div class="form-group">
                        <label>🌍 Chọn ngôn ngữ:</label>
                        <select id="chatbot-language" onchange="updateChatbotLanguage()">
                            <option value="vi-VN">🇻🇳 Tiếng Việt</option>
                            <option value="en-US">🇺🇸 English (US)</option>
                            <option value="en-GB">🇬🇧 English (UK)</option>
                        </select>
                        <small style="color: #666; display: block; margin-top: 5px;">
                            Ảnh hưởng đến nhận diện giọng nói và đọc văn bản
                        </small>
                    </div>
                    <div class="form-group">
                        <label>🤖 Chọn nhà cung cấp AI:</label>
                        <select id="chatbot-api-provider" onchange="updateChatbotApiInfo()">
                            <option value="groq">Groq (Khuyến nghị - Nhanh nhất ⚡)</option>
                            <option value="gemini">Google Gemini (Thông minh 🧠)</option>
                        </select>
                        <small style="color: #666; display: block; margin-top: 5px;">
                            ✅ API keys đã được tích hợp sẵn - Không cần nhập!
                        </small>
                    </div>
                    <button onclick="saveChatbotSettings()" class="chatbot-save-btn">
                        💾 Lưu cài đặt
                    </button>
                    <div class="chatbot-info-box" id="chatbot-api-info">
                        <strong>🚀 Groq AI - Siêu nhanh!</strong><br><br>
                        ✅ Phản hồi cực nhanh (1-2 giây)<br>
                        ✅ Model: LLaMA 3.3 70B<br>
                        ✅ Phù hợp cho câu trả lời nhanh<br>
                        ✅ API đã được tích hợp sẵn<br><br>
                        <strong>💡 Mẹo:</strong> Dùng Groq cho tốc độ, Gemini cho câu trả lời phức tạp!
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
}

function setupEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleChatbot);
    }
}

function toggleChatbot() {
    const chatWindow = document.getElementById('chatbot-window');
    const toggleBtn = document.getElementById('chatbot-toggle-btn');

    if (chatWindow && toggleBtn) {
        chatWindow.classList.toggle('show');
        toggleBtn.classList.toggle('hide');

        if (chatWindow.classList.contains('show')) {
            document.getElementById('chatbot-input')?.focus();
        }
    }
}

function loadSettings() {
    const saved = localStorage.getItem('chatbot_config');
    if (saved) {
        try {
            const savedConfig = JSON.parse(saved);
            // Cho phép người dùng thay đổi provider
            if (savedConfig.provider && API_KEYS[savedConfig.provider]) {
                apiConfig.provider = savedConfig.provider;
                apiConfig.apiKey = API_KEYS[savedConfig.provider];
            }
            // Load ngôn ngữ đã lưu
            if (savedConfig.language) {
                currentLanguage = savedConfig.language;
                // Cập nhật recognition language nếu đã khởi tạo
                if (recognition) {
                    recognition.lang = currentLanguage;
                }
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
    // Luôn đảm bảo có API key
    if (!apiConfig.apiKey && API_KEYS[apiConfig.provider]) {
        apiConfig.apiKey = API_KEYS[apiConfig.provider];
    }
    // Luôn cập nhật status sau khi load
    updateChatbotStatus();
}

function updateChatbotStatus() {
    const statusDot = document.getElementById('chatbot-status-dot');
    const statusText = document.getElementById('chatbot-status-text');

    if (statusDot && statusText) {
        if (apiConfig.apiKey) {
            statusDot.classList.add('connected');
            statusText.textContent = `Đã kết nối ${apiConfig.provider.toUpperCase()}`;
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Chưa kết nối';
        }
    }
}

// Cập nhật ngôn ngữ chatbot
function updateChatbotLanguage() {
    const languageSelect = document.getElementById('chatbot-language');
    if (languageSelect) {
        currentLanguage = languageSelect.value;
        
        // Cập nhật speech recognition
        if (recognition) {
            recognition.lang = currentLanguage;
        }
        
        console.log('🌍 Ngôn ngữ đã chuyển sang:', currentLanguage);
        
        // Hiển thị thông báo
        const langName = currentLanguage === 'vi-VN' ? 'Tiếng Việt' : 'English';
        alert(`✅ Đã chuyển sang ${langName}\n\n🎤 Nhận diện giọng nói: ${langName}\n🔊 Đọc văn bản: ${langName}`);
    }
}

function openChatbotSettings() {
    const modal = document.getElementById('chatbot-settings-modal');
    const provider = document.getElementById('chatbot-api-provider');
    const language = document.getElementById('chatbot-language');

    if (modal && provider && language) {
        provider.value = apiConfig.provider;
        language.value = currentLanguage;
        updateChatbotApiInfo();
        modal.classList.add('show');
    }
}

function closeChatbotSettings() {
    const modal = document.getElementById('chatbot-settings-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function updateChatbotApiInfo() {
    const provider = document.getElementById('chatbot-api-provider')?.value;
    const infoBox = document.getElementById('chatbot-api-info');

    if (!infoBox) return;

    const infos = {
        groq: `<strong>🚀 Groq AI - Siêu nhanh!</strong><br><br>
               ✅ Phản hồi cực nhanh (1-2 giây)<br>
               ✅ Model: LLaMA 3.3 70B<br>
               ✅ Phù hợp cho câu trả lời nhanh<br>
               ✅ API đã được tích hợp sẵn<br><br>
               <strong>💡 Mẹo:</strong> Dùng Groq cho tốc độ, Gemini cho câu trả lời phức tạp!`,
        gemini: `<strong>🌟 Google Gemini AI - Thông minh!</strong><br><br>
                 ✅ Model: Gemini 2.5 Flash<br>
                 ✅ Phản hồi chi tiết và sâu sắc<br>
                 ✅ Phù hợp cho câu hỏi phức tạp<br>
                 ✅ API đã được tích hợp sẵn<br><br>
                 <strong>💡 Mẹo:</strong> Dùng Gemini khi cần phân tích sâu, Groq khi cần trả lời nhanh!`
    };

    infoBox.innerHTML = infos[provider] || infos.groq;
}

function saveChatbotSettings() {
    const provider = document.getElementById('chatbot-api-provider')?.value;
    const language = document.getElementById('chatbot-language')?.value;

    // Cập nhật ngôn ngữ
    if (language) {
        currentLanguage = language;
        if (recognition) {
            recognition.lang = currentLanguage;
        }
    }

    // Cập nhật provider và sử dụng API key đã tích hợp sẵn
    if (provider && API_KEYS[provider]) {
        apiConfig.provider = provider;
        apiConfig.apiKey = API_KEYS[provider];
    }

    // Lưu cài đặt
    localStorage.setItem('chatbot_config', JSON.stringify({ 
        provider: apiConfig.provider, 
        language: currentLanguage 
    }));

    updateChatbotStatus();
    closeChatbotSettings();

    // Thông báo theo ngôn ngữ đã chọn
    let successMessage;
    const providerName = provider === 'groq' ? 'Groq' : provider === 'gemini' ? 'Gemini' : 'OpenAI';
    
    if (currentLanguage === 'vi-VN') {
        successMessage = `✅ Đã lưu cài đặt thành công!\n\n🤖 AI Provider: ${providerName}\n🌍 Ngôn ngữ: Tiếng Việt\n🎤 Nhận diện giọng nói: Tiếng Việt\n🔊 Đọc văn bản: Tiếng Việt\n\nBây giờ bạn có thể hỏi tôi bất cứ điều gì!`;
    } else {
        successMessage = `✅ Settings saved successfully!\n\n🤖 AI Provider: ${providerName}\n🌍 Language: English\n🎤 Speech recognition: English\n🔊 Text-to-speech: English\n\nYou can ask me anything now!`;
    }
    addChatbotMessage(successMessage, 'bot');
}

function handleChatbotKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatbotMessage();
    }
}

function sendQuickMessage(message) {
    const input = document.getElementById('chatbot-input');
    if (input) {
        input.value = message;
        sendChatbotMessage();
    }
}

async function sendChatbotMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send-btn');

    if (!input || !sendBtn) return;

    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addChatbotMessage(message, 'user');

    // Add to history
    conversationHistory.push({ role: 'user', content: message });

    // Clear input
    input.value = '';
    sendBtn.disabled = true;

    // Show typing
    showChatbotTyping();

    try {
        const response = await callChatbotAPI();
        hideChatbotTyping();
        addChatbotMessage(response, 'bot');
        conversationHistory.push({ role: 'assistant', content: response });

        // Keep last 20 messages
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
    } catch (error) {
        hideChatbotTyping();
        console.error('Error:', error);

        let errorMsg = '❌ Lỗi kết nối AI. ';
        if (error.message.includes('API key')) {
            errorMsg += 'Kiểm tra API key.';
        } else if (error.message.includes('quota')) {
            errorMsg += 'Hết quota. Đợi hoặc nâng cấp.';
        } else if (error.message.includes('rate limit')) {
            errorMsg += 'Quá nhiều request. Đợi 1 phút.';
        } else {
            errorMsg += error.message;
        }

        addChatbotMessage(errorMsg, 'bot');
    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
}

async function callChatbotAPI() {
    const { provider, apiKey } = apiConfig;
    const messages = [
        { role: 'system', content: getSystemPrompt() },
        ...conversationHistory
    ];

    if (provider === 'groq' || provider === 'openai') {
        const response = await fetch(API_ENDPOINTS[provider], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODELS[provider],
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } else if (provider === 'gemini') {
        const geminiMessages = conversationHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        if (geminiMessages.length > 0) {
            geminiMessages[0].parts[0].text = getSystemPrompt() + '\n\n' + geminiMessages[0].parts[0].text;
        }

        const response = await fetch(`${API_ENDPOINTS.gemini}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: geminiMessages,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
}

function addChatbotMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingIndicator = document.getElementById('chatbot-typing');

    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'bot' ? '🤖' : '👤';

    const content = document.createElement('div');
    content.className = 'message-content';

    // Format text
    let formattedText = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

    content.innerHTML = formattedText;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    messagesContainer.insertBefore(messageDiv, typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Tự động đọc tin nhắn từ bot - CHỈ sau khi người dùng đã tương tác
    if (sender === 'bot' && conversationHistory.length > 1) {
        // Đợi tin nhắn hiển thị, sau đó đọc
        setTimeout(() => {
            // Kiểm tra xem voices đã sẵn sàng chưa
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) {
                // Nếu chưa có voices, đợi chúng được load
                speechSynthesis.onvoiceschanged = () => {
                    speakText(text);
                };
            } else {
                speakText(text);
            }
        }, 500);
    }
}

function showChatbotTyping() {
    const typing = document.getElementById('chatbot-typing');
    if (typing) {
        typing.style.display = 'flex';
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

function hideChatbotTyping() {
    const typing = document.getElementById('chatbot-typing');
    if (typing) {
        typing.style.display = 'none';
    }
}
