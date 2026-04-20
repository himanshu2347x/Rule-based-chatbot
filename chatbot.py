import random
import re


def normalize(text):
    """Make matching easier by lowercasing and removing extra spaces."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s+\-*/%().]", "", text)
    return re.sub(r"\s+", " ", text)


def calculate(expression):
    """Safely solve very small arithmetic expressions like 12 + 8."""
    if not re.fullmatch(r"[\d\s+\-*/%().]+", expression):
        return None

    try:
        return eval(expression, {"__builtins__": {}}, {})
    except (SyntaxError, ZeroDivisionError, NameError):
        return None


def get_response(user_input):
    user_input = normalize(user_input)
    patterns = [
        {
            "name": "greeting",
            "regex": r"\b(hello|hi|hey|yo|hi|namaste)\b",
            "responses": [
                "Hey! How can I help you?",
                "Hi there! What do you want to talk about?",
                "Hello! Ask me something.",
            ],
        },
        {
            "name": "mood",
            "regex": r"\b(how are you|how r u|sup|whats up)\b",
            "responses": [
                "I'm just code, but I'm running nicely.",
                "Doing great. Thanks for asking!",
                "All good here. How are you?",
            ],
        },
        {
            "name": "help",
            "regex": r"\b(help|support|what can you do)\b",
            "responses": [
                "I can greet you, answer simple questions, remember your name, and do small math.",
                "Try: 'my name is Alex', 'what is 10 + 5', 'tell me a joke', or 'thanks'.",
            ],
        },
        {
            "name": "thanks",
            "regex": r"\b(thanks|thank you|thx)\b",
            "responses": [
                "You're welcome!",
                "Anytime.",
                "No problem.",
            ],
        },
        {
            "name": "joke",
            "regex": r"\b(joke|make me laugh|funny)\b",
            "responses": [
                "Why do programmers prefer dark mode? Because light attracts bugs.",
                "I told my computer I needed a break, and it said: no problem, I'll go to sleep.",
                "Why did the developer go broke? Because he used up all his cache.",
                "I would tell you a UDP joke, but you might not get it.",
                "Why do Java developers wear glasses? Because they do not C#.",
                "My code does not always work, but when it does, I do not know why.",
                "Debugging: being the detective in a crime movie where you are also the culprit.",
                "I asked the server for a joke, and it returned 404: humor not found.",
                "Why was the function sad? It did not get called.",
                "I tried to make a belt out of watches. It was a waist of time.",
                "Parallel lines have so much in common. It is a shame they will never meet.",
                "I told my code a joke, but it did not react. Must be a deadlock.",
                "Why was the math book upset? It had too many problems.",
                "I ate a clock yesterday. It was very time-consuming.",
                "Why did the scarecrow win an award? He was outstanding in his field.",
                "Why do bees have sticky hair? Because they use honeycombs.",
                "Why did the tomato blush? It saw the salad dressing.",
                "What do you call fake spaghetti? An impasta.",
                "I only know 25 letters of the alphabet. I do not know y.",
                "Why did the cookie go to the doctor? It felt crummy.",
                "What did one wall say to the other wall? I will meet you at the corner.",
                "Why can you not trust atoms? They make up everything.",
                "How do you organize a space party? You planet.",
                "What do you call cheese that is not yours? Nacho cheese.",
                "I used to play piano by ear, now I use my hands.",
            ],
        },
        {
            "name": "creator",
            "regex": r"\b(who made you|who created you|your creator)\b",
            "responses": [
                "You did. I'm your rule-based chatbot project.",
                "I was created from Python rules and a little patience.",
            ],
        },
    ]

    # Name detection
    name_match = re.search(r"\b(my name is|i am|i'm)\s+([a-z]+)\b", user_input)
    if name_match:
        name = name_match.group(2).title()
        return f"Nice to meet you, {name}!"

    math_match = re.search(
        r"(?:\b(what is|calculate|solve)\s+)?([\d\s+\-*/%().]+)",
        user_input,
    )

    if math_match:
        expression = math_match.group(2) if math_match.group(1) else math_match.group(0)

        if re.search(r"\d+\s*[\+\-*/%]\s*\d+", expression):
            result = calculate(expression)

            if result is not None:
                return f"The answer is {result}."
            return "I couldn't solve that expression."


    # Intent matching
    for pattern in patterns:
        if re.search(pattern["regex"], user_input):
            return random.choice(pattern["responses"])

    # Short input handling (fixed)
    if len(user_input.split()) <= 2 and not re.search(r"\d", user_input):
        return "Can you give me a little more detail?"

    return "Sorry, I don't understand that yet. Try asking for help."

def chatbot():
    print("Bot: Hello! Type 'bye' to exit.")

    while True:
        user_input = input("You: ")

        if normalize(user_input) in ["bye", "exit", "quit"]:
            print("Bot: Goodbye!")
            break

        response = get_response(user_input)
        print("Bot:", response)


chatbot()
