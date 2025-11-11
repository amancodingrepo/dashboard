# Vanna AI Setup Guide

Complete guide to setting up self-hosted Vanna AI with Groq for natural language SQL generation.

---

## 📦 What is Vanna AI?

Vanna AI is an open-source Python framework that converts natural language questions into SQL queries using LLMs. It:
- Connects directly to your PostgreSQL database
- Uses Groq (or other LLM providers) for SQL generation
- Returns both SQL and query results
- Supports context-aware queries

---

## 🚀 Quick Setup

### 1. Create Vanna Service Directory

```bash
mkdir vanna
cd vanna
```

### 2. Create `requirements.txt`

```txt
flask==3.0.0
flask-cors==4.0.0
vanna==0.5.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
groq==0.4.1
```

### 3. Create `app.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import vanna
from vanna.groq import Groq_Chat
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Vanna with Groq
class MyVanna(Groq_Chat, vanna.vannadb.VannaDB_VectorStore):
    def __init__(self, config=None):
        Groq_Chat.__init__(self, config=config)
        vanna.vannadb.VannaDB_VectorStore.__init__(self, config=config)

# Configure Vanna
vn = MyVanna(config={
    'api_key': os.getenv('GROQ_API_KEY'),
    'model': os.getenv('GROQ_MODEL', 'mixtral-8x7b-32768')
})

# Connect to PostgreSQL
database_url = os.getenv('DATABASE_URL')
vn.connect_to_postgres(url=database_url)

# Train Vanna with your schema
def train_vanna():
    """Train Vanna with database schema and sample queries"""
    
    # Add DDL for training
    ddl = """
    CREATE TABLE Invoice (
        id SERIAL PRIMARY KEY,
        invoice_ref VARCHAR,
        invoice_date TIMESTAMP,
        total_amount DECIMAL,
        payment_status VARCHAR,
        payment_due_date TIMESTAMP,
        vendor_id INTEGER REFERENCES Vendor(id)
    );
    
    CREATE TABLE Vendor (
        id SERIAL PRIMARY KEY,
        name VARCHAR,
        tax_id VARCHAR
    );
    
    CREATE TABLE LineItem (
        id SERIAL PRIMARY KEY,
        description VARCHAR,
        quantity DECIMAL,
        unit_price DECIMAL,
        total_price DECIMAL,
        document_id INTEGER
    );
    """
    
    vn.train(ddl=ddl)
    
    # Add sample questions and SQL for training
    training_data = [
        {
            "question": "What's the total spend?",
            "sql": "SELECT SUM(total_amount) FROM Invoice;"
        },
        {
            "question": "Show top 10 vendors by spend",
            "sql": """
                SELECT v.name, SUM(i.total_amount) as total_spend
                FROM Invoice i
                JOIN Vendor v ON i.vendor_id = v.id
                GROUP BY v.name
                ORDER BY total_spend DESC
                LIMIT 10;
            """
        },
        {
            "question": "List overdue invoices",
            "sql": """
                SELECT invoice_ref, total_amount, payment_due_date
                FROM Invoice
                WHERE payment_due_date < NOW()
                AND payment_status != 'paid';
            """
        }
    ]
    
    for item in training_data:
        vn.train(question=item["question"], sql=item["sql"])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "vanna-ai"})

@app.route('/generate-sql', methods=['POST'])
def generate_sql():
    try:
        data = request.get_json()
        question = data.get('question')
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        # Generate SQL
        sql = vn.generate_sql(question)
        
        # Execute SQL and get results
        df = vn.run_sql(sql)
        results = df.to_dict('records') if df is not None else []
        
        return jsonify({
            "question": question,
            "sql": sql,
            "results": results,
            "success": True
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/train', methods=['POST'])
def train():
    """Endpoint to train Vanna with new data"""
    try:
        train_vanna()
        return jsonify({"message": "Training completed", "success": True})
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500

if __name__ == '__main__':
    # Initial training
    print("Training Vanna AI...")
    train_vanna()
    print("Training complete!")
    
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### 4. Create `.env`

```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/database
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=mixtral-8x7b-32768
PORT=8000
```

### 5. Create `Dockerfile`

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
```

---

## 🔑 Get Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Navigate to API Keys section
4. Create new API key
5. Copy and save the key

---

## 🏃 Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/dbname"
export GROQ_API_KEY="your-key-here"

# Run the service
python app.py
```

Service will run on `http://localhost:8000`

---

## 🧪 Testing Vanna AI

```bash
# Health check
curl http://localhost:8000/health

# Generate SQL
curl -X POST http://localhost:8000/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question": "Show total spend by vendor"}'

# Train with new data
curl -X POST http://localhost:8000/train
```

---

## 🚀 Deployment Options

### Option 1: Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

**Settings:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `python app.py`
- Port: 8000

### Option 2: Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set DATABASE_URL=...
railway variables set GROQ_API_KEY=...

# Deploy
railway up
```

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Set secrets
fly secrets set DATABASE_URL=...
fly secrets set GROQ_API_KEY=...

# Deploy
fly deploy
```

### Option 4: Digital Ocean App Platform

1. Connect GitHub repository
2. Select Python app
3. Set build/run commands
4. Add environment variables
5. Deploy

---

## 🔗 Backend Integration

Update `apps/api/.env`:

```env
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
VANNA_API_KEY=optional-if-you-add-auth
```

The backend will automatically:
- Forward queries to Vanna AI
- Parse SQL and results
- Return formatted responses
- Fall back to local processing if Vanna unavailable

---

## 🎯 Training Vanna

### Add Domain Knowledge

```python
# Add table schemas
vn.train(ddl="CREATE TABLE ...")

# Add documentation
vn.train(documentation="Vendor table contains supplier information...")

# Add sample Q&A pairs
vn.train(
    question="Show monthly revenue",
    sql="SELECT DATE_TRUNC('month', invoice_date) as month, SUM(total_amount) FROM Invoice GROUP BY month"
)
```

### Best Practices

1. **Start Simple**: Train with basic queries first
2. **Add Context**: Include table relationships in DDL
3. **Use Examples**: More Q&A pairs = better results
4. **Iterate**: Retrain based on user feedback
5. **Monitor**: Log queries and results for improvement

---

## 🔒 Security

### Production Checklist

- [ ] Add API authentication
- [ ] Limit request rate
- [ ] Sanitize SQL output
- [ ] Use read-only database user
- [ ] Enable HTTPS
- [ ] Set CORS origins
- [ ] Monitor query patterns
- [ ] Log all requests

### Example: Add API Key Auth

```python
@app.before_request
def check_auth():
    if request.path == '/health':
        return None
    
    api_key = request.headers.get('Authorization')
    expected_key = os.getenv('VANNA_API_KEY')
    
    if not expected_key or api_key != f"Bearer {expected_key}":
        return jsonify({"error": "Unauthorized"}), 401
```

---

## 📊 Monitoring

### Useful Logs

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/generate-sql', methods=['POST'])
def generate_sql():
    logger.info(f"Question received: {question}")
    logger.info(f"Generated SQL: {sql}")
    logger.info(f"Results count: {len(results)}")
```

### Metrics to Track

- Request count
- Response time
- Success/failure rate
- Most common queries
- SQL generation accuracy

---

## 🐛 Troubleshooting

### Common Issues

**Can't connect to database**
```
Error: psycopg2.OperationalError
Solution: Check DATABASE_URL format and database accessibility
```

**Groq API errors**
```
Error: API key invalid
Solution: Verify GROQ_API_KEY in environment variables
```

**Poor SQL quality**
```
Issue: Generated SQL doesn't match intent
Solution: Add more training examples for similar queries
```

---

## 💡 Advanced Features

### Custom SQL Generation

```python
# Override SQL generation logic
def custom_generate_sql(question):
    # Add preprocessing
    question = question.lower().strip()
    
    # Generate SQL
    sql = vn.generate_sql(question)
    
    # Add safety checks
    if "DROP" in sql.upper() or "DELETE" in sql.upper():
        raise Exception("Unsafe SQL detected")
    
    return sql
```

### Result Formatting

```python
def format_results(df):
    # Convert decimals to float
    # Format dates
    # Add calculated fields
    return df.to_dict('records')
```

---

**Last Updated**: November 11, 2025  
**Version**: 1.0.0  
**Vanna Version**: 0.5.0
