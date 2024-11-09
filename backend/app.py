from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
# Replace with your MongoDB URI
app.config["MONGO_URI"] = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/medical_records?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc.get('_id'):
        doc['_id'] = str(doc['_id'])
    return doc

@app.route("/api/register", methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if mongo.db.users.find_one({"email": data['email']}):
        return jsonify({"error": "Email already registered"}), 400
    
    user = {
        "username": data['username'],
        "email": data['email'],
        "password": generate_password_hash(data['password']),
        "created_at": datetime.utcnow()
    }
    
    mongo.db.users.insert_one(user)
    user['_id'] = str(user['_id'])
    del user['password']
    
    return jsonify({"message": "User registered successfully", "user": user}), 201

@app.route("/api/login", methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({"email": data['email']})
    
    if user and check_password_hash(user['password'], data['password']):
        user['_id'] = str(user['_id'])
        del user['password']
        return jsonify({
            "message": "Login successful",
            "user": user
        })
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/expenses", methods=['GET', 'POST'])
def handle_expenses():
    if request.method == 'POST':
        data = request.get_json()
        expense = {
            "expense_claim_date": datetime.strptime(data['expense_claim_date'], '%Y-%m-%d'),
            "expense_category": data['expense_category'],
            "description": data['description'],
            "amount": float(data['amount']),
            "user_id": str(data['user_id']),
            "created_at": datetime.utcnow()
        }
        
        result = mongo.db.expenses.insert_one(expense)
        expense['_id'] = str(result.inserted_id)
        
        return jsonify({"message": "Expense added successfully", "expense": expense}), 201
    
    # GET method
    user_id = request.args.get('user_id')
    expenses = list(mongo.db.expenses.find({"user_id": user_id}))
    return jsonify([serialize_doc(exp) for exp in expenses])

@app.route("/api/bills", methods=['GET', 'POST'])
def handle_bills():
    if request.method == 'POST':
        data = request.get_json()
        bill = {
            "bill_type": data['bill_type'],
            "bill_date": datetime.strptime(data['bill_date'], '%Y-%m-%d'),
            "due_date": datetime.strptime(data['due_date'], '%Y-%m-%d'),
            "amount": float(data['amount']),
            "user_id": str(data['user_id']),
            "created_at": datetime.utcnow()
        }
        
        result = mongo.db.bills.insert_one(bill)
        bill['_id'] = str(result.inserted_id)
        
        return jsonify({"message": "Bill added successfully", "bill": bill}), 201
    
    user_id = request.args.get('user_id')
    bills = list(mongo.db.bills.find({"user_id": user_id}))
    return jsonify([serialize_doc(bill) for bill in bills])

# File upload handler
@app.route("/api/upload", methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        # Save file to MongoDB GridFS
        file_id = mongo.save_file(file.filename, file)
        return jsonify({
            "message": "File uploaded successfully",
            "file_id": str(file_id)
        }), 201

@app.route("/api/files/<filename>")
def get_file(filename):
    return mongo.send_file(filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)