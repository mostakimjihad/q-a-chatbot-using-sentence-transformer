from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from flask_cors import CORS
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException
import numpy as np

DetectorFactory.seed = 0

app = Flask(__name__)
CORS(app)

# Initialize the SentenceTransformer model
sentence_model = SentenceTransformer("Alibaba-NLP/gte-multilingual-base", trust_remote_code=True)

# Function to load the knowledge base
def load_knowledge_base(file_path):
    knowledge_base = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            question, answer = line.strip().split('|')
            knowledge_base[question] = answer
    return knowledge_base

# Function to save the question embeddings
def save_embeddings(questions, file_path='question_embeddings.npy'):
    question_embeddings = sentence_model.encode(questions)
    np.save(file_path, question_embeddings)

# Function to load the precomputed embeddings
def load_embeddings(file_path='question_embeddings.npy'):
    return np.load(file_path)

# Function to log unanswered questions
def log_fallback_question(user_input, log_file='fallback_questions.txt'):
    with open(log_file, 'a', encoding='utf-8') as file:
        file.write(f"{user_input}\n")

# Function to detect the language of the input text
def detect_language(text):
    try:
        lang = detect(text)
        return lang
    except LangDetectException:
        return None

# Function to find the best match for the user input
def find_best_match(user_input, knowledge_base, question_embeddings):
    user_input_embedding = sentence_model.encode([user_input])
    
    similarity_scores = cosine_similarity(user_input_embedding, question_embeddings)
    best_match_idx = similarity_scores.argmax()
    
    if similarity_scores.max() > 0.85:
        return list(knowledge_base.values())[best_match_idx]
    else:
        log_fallback_question(user_input)  
        return "দুঃখিত, আমি আপনার প্রশ্ন বুঝতে পারিনি।"

# Load the knowledge base
knowledge_base = load_knowledge_base('knowledge_base.txt')
questions = list(knowledge_base.keys())

# Save the precomputed embeddings (run this once)
save_embeddings(questions)

# Load the precomputed embeddings
question_embeddings = load_embeddings()

# API endpoint for chat
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('user_input', '')
    
    if not user_input:
        return jsonify({"user_input": "প্রশ্ন ঘরটি খালি রেখেছেন। তাই উত্তর দেয়া সম্ভব নয়।"}), 400
    
    # Detect language
    lang = detect_language(user_input)
    
    if lang != 'bn':
        return jsonify({"user_input": user_input, "response": "বাংলায় কথা বলুন"}), 400
    
    response = find_best_match(user_input, knowledge_base, question_embeddings)
    return jsonify({"user_input": user_input, "response": response})

if __name__ == "__main__":
    app.run(debug=True)
