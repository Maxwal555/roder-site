/**
 * RODER AI Chatbot
 * Собирает информацию о потребностях клиента и отправляет на email
 */

(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        formspreeEndpoint: 'https://formspree.io/f/xojbokkd',
        botName: 'РОДЕР Ассистент',
        email: 'mv@roder.ru'
    };

    // Сценарий диалога
    const FLOW = [
        {
            id: 'welcome',
            message: 'Здравствуйте! Я виртуальный ассистент компании РОДЕР. Помогу подобрать конструкцию и рассчитать стоимость. Что вас интересует?',
            options: ['Аренда конструкций', 'Покупка конструкций', 'Временная застройка мероприятий'],
            field: 'interest'
        },
        {
            id: 'type',
            message: 'Какой тип конструкции вам нужен?',
            options: ['Склад / ангар', 'Шатёр / павильон', 'Спортивный объект', 'Блок-модульное здание', 'Другое'],
            field: 'type'
        },
        {
            id: 'size',
            message: 'Подскажите примерные габариты (ШхДхВ в метрах)? Если не знаете точно — напишите примерную площадь.',
            input: true,
            placeholder: 'Например: 20x40x6 м или ~800 м²',
            field: 'size'
        },
        {
            id: 'region',
            message: 'В каком регионе планируется установка?',
            input: true,
            placeholder: 'Город или область',
            field: 'region'
        },
        {
            id: 'timeline',
            message: 'Когда планируете начать? Есть ли сроки?',
            options: ['В ближайший месяц', 'В течение 3 месяцев', 'Планирую на следующий год', 'Просто изучаю варианты'],
            field: 'timeline'
        },
        {
            id: 'name',
            message: 'Отлично! Чтобы подготовить расчёт, мне нужны ваши контакты. Как вас зовут?',
            input: true,
            placeholder: 'Ваше имя',
            field: 'name'
        },
        {
            id: 'phone',
            message: 'Номер телефона для связи:',
            input: true,
            placeholder: '+7 (___) ___-__-__',
            field: 'phone',
            type: 'tel'
        },
        {
            id: 'email',
            message: 'Email (необязательно, но удобно для отправки КП):',
            input: true,
            placeholder: 'email@example.com',
            field: 'email',
            type: 'email',
            optional: true
        },
        {
            id: 'done',
            message: 'Спасибо! Ваша заявка отправлена. Наш менеджер свяжется с вами в ближайшее время для уточнения деталей и расчёта стоимости. Хорошего дня!',
            final: true
        }
    ];

    let currentStep = 0;
    let collectedData = {};
    let chatOpen = false;

    // Создание виджета
    function createWidget() {
        // Кнопка чата
        const btn = document.createElement('div');
        btn.id = 'roder-chat-btn';
        btn.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
                <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12ZM7 6H17V8H7V6Z" fill="white"/>
            </svg>
        `;
        document.body.appendChild(btn);

        // Окно чата
        const chat = document.createElement('div');
        chat.id = 'roder-chat-window';
        chat.innerHTML = `
            <div class="roder-chat-header">
                <span>${CONFIG.botName}</span>
                <button id="roder-chat-close">✕</button>
            </div>
            <div class="roder-chat-messages" id="roder-chat-messages"></div>
            <div class="roder-chat-input-area" id="roder-chat-input-area"></div>
        `;
        document.body.appendChild(chat);

        // События
        btn.addEventListener('click', toggleChat);
        document.getElementById('roder-chat-close').addEventListener('click', toggleChat);
    }

    function toggleChat() {
        chatOpen = !chatOpen;
        const win = document.getElementById('roder-chat-window');
        const btn = document.getElementById('roder-chat-btn');
        
        if (chatOpen) {
            win.classList.add('open');
            btn.classList.add('hidden');
            if (currentStep === 0) {
                showStep(0);
            }
        } else {
            win.classList.remove('open');
            btn.classList.remove('hidden');
        }
    }

    function showStep(stepIndex) {
        const step = FLOW[stepIndex];
        if (!step) return;

        addBotMessage(step.message);

        if (step.final) {
            sendData();
            hideInput();
            return;
        }

        if (step.options) {
            showOptions(step.options, step.field);
        } else if (step.input) {
            showInput(step.placeholder || '', step.type || 'text', step.field, step.optional);
        }
    }

    function addBotMessage(text) {
        const container = document.getElementById('roder-chat-messages');
        const msg = document.createElement('div');
        msg.className = 'roder-msg bot';
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function addUserMessage(text) {
        const container = document.getElementById('roder-chat-messages');
        const msg = document.createElement('div');
        msg.className = 'roder-msg user';
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function showOptions(options, field) {
        const area = document.getElementById('roder-chat-input-area');
        area.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'roder-options';
        
        options.forEach(function(opt) {
            const btn = document.createElement('button');
            btn.className = 'roder-option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', function() {
                selectOption(opt, field);
            });
            wrap.appendChild(btn);
        });
        
        area.appendChild(wrap);
    }

    function showInput(placeholder, type, field, optional) {
        const area = document.getElementById('roder-chat-input-area');
        area.innerHTML = `
            <div class="roder-input-wrap">
                <input type="${type}" id="roder-user-input" placeholder="${placeholder}" autocomplete="off">
                <button id="roder-send-btn">${optional ? 'Пропустить' : '→'}</button>
            </div>
        `;

        const input = document.getElementById('roder-user-input');
        const sendBtn = document.getElementById('roder-send-btn');

        function submit() {
            const val = input.value.trim();
            if (!val && !optional) return;
            const answer = val || '(не указано)';
            addUserMessage(answer);
            collectedData[field] = answer;
            currentStep++;
            showStep(currentStep);
        }

        sendBtn.addEventListener('click', submit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') submit();
        });
        input.focus();
    }

    function hideInput() {
        const area = document.getElementById('roder-chat-input-area');
        area.innerHTML = '<div class="roder-chat-done">Диалог завершён</div>';
    }

    function selectOption(value, field) {
        addUserMessage(value);
        collectedData[field] = value;
        currentStep++;
        showStep(currentStep);
    }

    function sendData() {
        const body = {
            _subject: 'Новая заявка с чат-бота RODER',
            Интерес: collectedData.interest || '',
            'Тип конструкции': collectedData.type || '',
            Габариты: collectedData.size || '',
            Регион: collectedData.region || '',
            Сроки: collectedData.timeline || '',
            Имя: collectedData.name || '',
            Телефон: collectedData.phone || '',
            Email: collectedData.email || '',
            Источник: window.location.href,
            Дата: new Date().toLocaleString('ru-RU')
        };

        fetch(CONFIG.formspreeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(body)
        }).then(function(response) {
            if (!response.ok) {
                console.log('Chatbot: email send failed, status:', response.status);
            }
        }).catch(function(err) {
            console.log('Chatbot: network error', err);
        });
    }

    // Инициализация
    function init() {
        createWidget();
        injectStyles();
    }

    function injectStyles() {
        const css = `
            #roder-chat-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: #E3000F;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(227, 0, 15, 0.4);
                z-index: 10000;
                transition: transform 0.3s, opacity 0.3s;
            }
            #roder-chat-btn:hover { transform: scale(1.1); }
            #roder-chat-btn.hidden { transform: scale(0); opacity: 0; pointer-events: none; }

            #roder-chat-window {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 380px;
                height: 520px;
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                z-index: 10001;
                overflow: hidden;
                transform: scale(0);
                transform-origin: bottom right;
                transition: transform 0.3s ease;
            }
            #roder-chat-window.open { transform: scale(1); }

            .roder-chat-header {
                background: #232429;
                color: #fff;
                padding: 16px 20px;
                font-family: Manrope, sans-serif;
                font-weight: 600;
                font-size: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .roder-chat-header button {
                background: none;
                border: none;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }

            .roder-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .roder-msg {
                max-width: 85%;
                padding: 10px 14px;
                border-radius: 12px;
                font-family: Manrope, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                word-wrap: break-word;
            }
            .roder-msg.bot {
                background: #f1f1f1;
                color: #000;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }
            .roder-msg.user {
                background: #E3000F;
                color: #fff;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .roder-chat-input-area {
                padding: 12px 16px;
                border-top: 1px solid #eee;
                min-height: 60px;
            }

            .roder-options {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .roder-option-btn {
                background: #fff;
                border: 1px solid #E3000F;
                color: #E3000F;
                padding: 8px 14px;
                border-radius: 20px;
                font-family: Manrope, sans-serif;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .roder-option-btn:hover {
                background: #E3000F;
                color: #fff;
            }

            .roder-input-wrap {
                display: flex;
                gap: 8px;
            }
            .roder-input-wrap input {
                flex: 1;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 10px 14px;
                font-family: Manrope, sans-serif;
                font-size: 14px;
                outline: none;
            }
            .roder-input-wrap input:focus { border-color: #E3000F; }
            .roder-input-wrap button {
                background: #E3000F;
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 10px 16px;
                font-size: 16px;
                cursor: pointer;
                font-family: Manrope, sans-serif;
            }
            .roder-input-wrap button:hover { background: #c5000d; }

            .roder-chat-done {
                text-align: center;
                color: #999;
                font-family: Manrope, sans-serif;
                font-size: 13px;
                padding: 8px;
            }

            @media (max-width: 480px) {
                #roder-chat-window {
                    width: calc(100vw - 20px);
                    height: calc(100vh - 100px);
                    bottom: 10px;
                    right: 10px;
                }
            }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Запуск после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
