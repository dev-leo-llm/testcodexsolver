# SolverLLM

Пошаговая инструкция, как собрать и запустить **Local LLM Solver** на локальном компьютере.

## 1) Подготовка структуры проекта

Создай корневую папку, например `llm-solver`, и внутри неё папку `server`.

```text
llm-solver/
└── server/
```

> Папку `client` создадим позже через Vite.

---

## 2) Сборка Backend (Express + SSE)

Открой терминал и перейди в папку backend:

```bash
cd llm-solver/server
```

### 2.1 Создай файлы backend

В `server/` создай и заполни файлами из этого репозитория:

- `package.json`
- `config.json`
- `index.js`

Создай подпапки:

- `services/`
- `prompts/`

Заполни файлы:

- `services/fileProcessor.js`
- `services/llmAdapter.js`
- `services/orchestrator.js`
- `services/solverRunner.js`
- `prompts/orchestrator.md`

### 2.2 Установка зависимостей backend

```bash
npm install
```

### 2.3 Запуск backend

```bash
node index.js
```

Ожидаемое сообщение:

```text
Server running on port 3000
```

Не закрывай это окно терминала.

---

## 3) Сборка Frontend (Vite + React + Tailwind)

Открой **второй терминал** (backend оставь запущенным) и перейди в корень `llm-solver`.

### 3.1 Создай Vite React-проект

```bash
npm create vite@latest client -- --template react
cd client
npm install
```

### 3.2 Установи Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3.3 Настрой Tailwind

Открой `client/tailwind.config.js` и укажи:

```js
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
],
```

Открой `client/src/index.css`, очисти файл и вставь:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3.4 Подключи UI-код

В `client/src`:

- удали `App.css`
- замени `App.jsx` на версию из этого репозитория
- создай `components/`
- добавь:
  - `components/InputSection.jsx`
  - `components/TaskBlock.jsx`

### 3.5 Запусти frontend

```bash
npm run dev
```

Открой ссылку из терминала (обычно `http://localhost:5173`).

---

## 4) Проверка MVP

1. Открой UI в браузере (тёмная тема).
2. Введи текст в поле `Prompt`, например: `Test plan`.
3. Нажми `Start`.
4. В интерфейсе должны появиться шаги:
   - план задач (`plan`)
   - поток токенов по задачам (`token`)
   - завершение задач (`done`)

Сейчас в `services/llmAdapter.js` используются **mock-заглушки**, поэтому ответы будут демонстрационными.

---

## 5) Переход с mock на реальную модель

Когда будешь готов подключить реальный LLM-провайдер:

1. Останови backend (`Ctrl + C`).
2. Установи SDK в `server/`:

   ```bash
   npm install @mariozechner/pi-ai
   ```

3. Открой `services/llmAdapter.js`.
4. Замени mock-логику в методах `generate` и `stream` на реальные вызовы SDK.

---

## 6) Частые проблемы

- **`npm install` даёт ошибки доступа/прокси**  
  Проверь доступ к npm registry и прокси-настройки.

- **CORS/сетевые ошибки во frontend**  
  Убедись, что backend действительно запущен на `http://localhost:3000`.

- **Нет событий в UI**  
  Проверь вкладку Network в DevTools: запрос к `/api/solve` должен оставаться открытым и получать `data: ...` чанки.

---

Если что-то упадёт с ошибкой — скопируй стек/лог и проверь сначала, что backend и frontend запущены в разных терминалах и на ожидаемых портах.
