import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Sender = 'bot' | 'user'

type Message = {
  id: number
  sender: Sender    
  text: string
  time: string
}

type Pattern = {
  name: string
  regex: RegExp
  responses: string[]
}

const patterns: Pattern[] = [
  {
    name: 'Greeting',
    regex: /\b(hello|hi|hey|yo|namaste)\b/,
    responses: [
      'Hey! How can I help you?',
      'Hi there! What do you want to talk about?',
      'Hello! Ask me something.',
    ],
  },
  {
    name: 'Mood',
    regex: /\b(how are you|how r u|sup|whats up)\b/,
    responses: [
      "I'm just code, but I'm running nicely.",
      'Doing great. Thanks for asking!',
      'All good here. How are you?',
    ],
  },
  {
    name: 'Help',
    regex: /\b(help|support|what can you do)\b/,
    responses: [
      'I can greet you, answer simple questions, remember your name, and do small math.',
      "Try: 'my name is Alex', 'what is 10 + 5', 'tell me a joke', or 'thanks'.",
    ],
  },
  {
    name: 'Thanks',
    regex: /\b(thanks|thank you|thx)\b/,
    responses: ["You're welcome!", 'Anytime.', 'No problem.'],
  },
  {
    name: 'Joke',
    regex: /\b(joke|make me laugh|funny)\b/,
    responses: [
      'Why do programmers prefer dark mode? Because light attracts bugs.',
      "I told my computer I needed a break, and it said: no problem, I'll go to sleep.",
      'Why did the developer go broke? Because he used up all his cache.',
      'I would tell you a UDP joke, but you might not get it.',
      'Why do Java developers wear glasses? Because they do not C#.',
      'My code does not always work, but when it does, I do not know why.',
      'Debugging: being the detective in a crime movie where you are also the culprit.',
      'I asked the server for a joke, and it returned 404: humor not found.',
      'Why was the function sad? It did not get called.',
      'I tried to make a belt out of watches. It was a waist of time.',
      'Parallel lines have so much in common. It is a shame they will never meet.',
      'I told my code a joke, but it did not react. Must be a deadlock.',
      'Why was the math book upset? It had too many problems.',
      'I ate a clock yesterday. It was very time-consuming.',
      'Why did the scarecrow win an award? He was outstanding in his field.',
      'Why do bees have sticky hair? Because they use honeycombs.',
      'Why did the tomato blush? It saw the salad dressing.',
      'What do you call fake spaghetti? An impasta.',
      'I only know 25 letters of the alphabet. I do not know y.',
      'Why did the cookie go to the doctor? It felt crummy.',
      'What did one wall say to the other wall? I will meet you at the corner.',
      'Why can you not trust atoms? They make up everything.',
      'How do you organize a space party? You planet.',
      'What do you call cheese that is not yours? Nacho cheese.',
      'I used to play piano by ear, now I use my hands.',
    ],
  },
  {
    name: 'Creator',
    regex: /\b(who made you|who created you|your creator)\b/,
    responses: [
      "You did. I'm your rule-based chatbot project.",
      'I was created from Python rules and a little patience.',
    ],
  },
]

const suggestions = [
  'what can you do?',
  'my name is Alex',
  'what is 18 * 7',
  'tell me a joke',
]

function nowTime() {
  return new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s+\-*/%().]/g, '')
    .replace(/\s+/g, ' ')
}

function getRandomResponse(responses: string[]) {
  return responses[Math.floor(Math.random() * responses.length)]
}

function calculate(expression: string) {
  if (!/^[\d\s+\-*/%().]+$/.test(expression)) {
    return null
  }

  try {
    const result = Function(`"use strict"; return (${expression})`)()
    return Number.isFinite(result) ? result : null
  } catch {
    return null
  }
}

function getBotResponse(input: string) {
  const userInput = normalize(input)

  if (['bye', 'exit', 'quit'].includes(userInput)) {
    return 'Goodbye! Come back when you want to test more rules.'
  }

  const nameMatch = userInput.match(/\b(my name is|i am|im)\s+([a-z]+)\b/)

  if (nameMatch?.[2]) {
    const name = nameMatch[2][0].toUpperCase() + nameMatch[2].slice(1)
    return `Nice to meet you, ${name}!`
  }

  const mathMatch = userInput.match(
    /(?:\b(what is|calculate|solve)\s+)?([\d\s+\-*/%().]+)/,
  )

  if (mathMatch) {
    const expression = mathMatch[1] ? mathMatch[2] : mathMatch[0]

    if (/\d+\s*[+\-*/%]\s*\d+/.test(expression)) {
      const result = calculate(expression)
      return result !== null
        ? `The answer is ${result}.`
        : "I couldn't solve that expression."
    }
  }

  const matchedPattern = patterns.find((pattern) => pattern.regex.test(userInput))

  if (matchedPattern) {
    return getRandomResponse(matchedPattern.responses)
  }

  if (userInput.split(' ').length <= 2 && !/\d/.test(userInput)) {
    return 'Can you give me a little more detail?'
  }

  return "Sorry, I don't understand that yet. Try asking for help."
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your rule-based chatbot. Type a message or pick a prompt.",
      time: nowTime(),
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messageListRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(2)

  const activeIntents = useMemo(
    () => patterns.map((pattern) => pattern.name).join(', '),
    [],
  )

  useEffect(() => {
    const messageList = messageListRef.current

    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight
    }
  }, [messages, isThinking])

  function addExchange(text: string) {
    const trimmedText = text.trim()

    if (!trimmedText || isThinking) {
      return
    }

    const userMessage: Message = {
      id: nextId.current,
      sender: 'user',
      text: trimmedText,
      time: nowTime(),
    }
    nextId.current += 1

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInput('')
    setIsThinking(true)

    window.setTimeout(() => {
      const botMessage: Message = {
        id: nextId.current,
        sender: 'bot',
        text: getBotResponse(trimmedText),
        time: nowTime(),
      }
      nextId.current += 1

      setMessages((currentMessages) => [...currentMessages, botMessage])
      setIsThinking(false)
    }, 520)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addExchange(input)
  }

  function resetChat() {
    nextId.current = 2
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Hello! I'm your rule-based chatbot. Type a message or pick a prompt.",
        time: nowTime(),
      },
    ])
    setInput('')
    setIsThinking(false)
  }

  return (
    <main className="app-shell">  

      <section className="chat-workspace" aria-label="RuleBot chat workspace">
        <aside className="side-panel" aria-label="Bot reference">
          <div>
            <h2>Conversation map</h2>
            <p>{activeIntents}</p>
          </div>

          <div className="prompt-stack" aria-label="Suggested prompts">
            {suggestions.map((suggestion) => (
              <button
                className="prompt-chip"
                key={suggestion}
                onClick={() => addExchange(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <button className="secondary-action" onClick={resetChat} type="button">
            Clear chat
          </button>
        </aside>

        <section className="chat-panel" aria-label="Chat">
          <header className="chat-header">
            <div className="bot-avatar" aria-hidden="true">
              RB
            </div>
            <div>
              <p>RuleBot</p>
              <span>{isThinking ? 'Thinking...' : 'Online'}</span>
            </div>
          </header>

          <div className="message-list" aria-live="polite" ref={messageListRef}>
            {messages.map((message) => (
              <article
                className={`message-row ${message.sender}`}
                key={message.id}
              >
                <div className="message-bubble">
                  <p>{message.text}</p>
                  <time>{message.time}</time>
                </div>
              </article>
            ))}

            {isThinking && (
              <article className="message-row bot">
                <div className="message-bubble typing-bubble" aria-label="Bot is typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </article>
            )}
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <input
              aria-label="Message RuleBot"
              autoComplete="off"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for help, share your name, or try 24 / 3..."
              type="text"
              value={input}
            />
            <button disabled={!input.trim() || isThinking} type="submit">
              Send
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}

export default App
