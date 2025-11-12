from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
from groq import Groq
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Groq client lazily
groq_api_key = os.getenv('GROQ_API_KEY')
groq_model = os.getenv('GROQ_MODEL', 'mixtral-8x7b-32768')
groq_client = None

def get_groq_client():
    """Get or initialize Groq client"""
    global groq_client
    if groq_client is None:
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        groq_client = Groq(api_key=groq_api_key)
    return groq_client

# Database connection
def get_db_connection():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

# Schema information for context
SCHEMA_CONTEXT = """
Database Schema:
1. Invoice table: id, invoice_ref, invoice_date, total_amount, payment_status, payment_due_date, vendor_id
2. Vendor table: id, name, tax_id
3. Customer table: id, name, address
4. LineItem table: id, description, quantity, unit_price, total_price, document_id
5. Document table: id, name, file_size, is_validated_by_human

Relationships:
- Invoice.vendor_id -> Vendor.id
- Invoice.customer_id -> Customer.id
- LineItem.document_id -> Document.id
"""

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "service": "Vanna AI Backend",
        "status": "✅ Running successfully on Render",
        "python_version": "3.12",
        "endpoints": {
            "health": "/health",
            "generate_sql": "/generate-sql (POST)",
            "train": "/train (POST)"
        },
        "message": "Vanna AI service is live and ready to generate SQL from natural language!"
    })

@app.route('/health', methods=['GET'])
def health():
    try:
        # Basic health check without external dependencies
        health_status = {
            "status": "healthy", 
            "service": "vanna-ai",
            "python_version": "3.12",
            "groq_configured": bool(groq_api_key),
            "database_url_set": bool(os.getenv('DATABASE_URL')),
            "timestamp": "2024-11-12T07:50:00Z"
        }
        
        # Only test Groq if explicitly requested
        if request.args.get('test_groq') == 'true' and groq_api_key:
            try:
                get_groq_client()
                health_status["groq_test"] = "passed"
            except Exception as groq_error:
                health_status["groq_test"] = f"failed: {str(groq_error)}"
                health_status["status"] = "degraded"
        
        return jsonify(health_status)
    except Exception as e:
        return jsonify({
            "status": "error",
            "service": "vanna-ai",
            "error": str(e)
        }), 500

@app.route('/generate-sql', methods=['POST'])
def generate_sql():
    try:
        data = request.get_json()
        question = data.get('question')
        
        if not question:
            return jsonify({"error": "Question is required", "success": False}), 400
        
        if not groq_api_key:
            return jsonify({
                "error": "GROQ_API_KEY not configured. Please set the GROQ_API_KEY environment variable.",
                "success": False
            }), 503
        
        # Generate SQL using Groq
        prompt = f"""You are a SQL expert. Given the following database schema and a natural language question, generate a valid PostgreSQL query.

{SCHEMA_CONTEXT}

Question: {question}

Generate ONLY the SQL query, no explanations. Use proper PostgreSQL syntax.
Include appropriate JOINs, WHERE clauses, and ORDER BY as needed.
Format currency as numeric/decimal types.
Use date functions like NOW(), DATE_TRUNC() for date operations.

SQL Query:"""
        
        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a SQL expert that generates PostgreSQL queries. Output only valid SQL, no explanations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=groq_model,
            temperature=0.1,
            max_tokens=1024,
        )
        
        sql = chat_completion.choices[0].message.content.strip()
        
        # Clean up SQL (remove markdown code blocks if present)
        sql = sql.replace('```sql', '').replace('```', '').strip()
        
        # Execute SQL and get results
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(sql)
            
            # Get column names
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            
            # Fetch results
            rows = cursor.fetchall()
            
            # Convert to list of dicts
            results = []
            for row in rows:
                result_dict = {}
                for i, col in enumerate(columns):
                    value = row[i]
                    # Convert to JSON-serializable types
                    if hasattr(value, 'isoformat'):  # datetime
                        value = value.isoformat()
                    result_dict[col] = value
                results.append(result_dict)
            
            cursor.close()
            conn.close()
            
            return jsonify({
                "question": question,
                "sql": sql,
                "results": results,
                "success": True
            })
            
        except Exception as db_error:
            cursor.close()
            conn.close()
            return jsonify({
                "error": f"SQL execution error: {str(db_error)}",
                "sql": sql,
                "success": False
            }), 500
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/train', methods=['POST'])
def train():
    """
    Endpoint to update schema context or add training examples
    In a full Vanna implementation, this would train the vector store
    """
    return jsonify({
        "message": "Training endpoint - currently using schema context",
        "success": True
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    print(f"Starting Vanna AI service on port {port}")
    print("Schema context loaded")
    app.run(host='0.0.0.0', port=port, debug=False)
