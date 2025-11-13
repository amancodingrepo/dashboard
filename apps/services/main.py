from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os, requests, asyncpg, re, json, logging, time
from typing import Optional
from groq import Client

app = FastAPI()
logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO").upper())
logger = logging.getLogger("vanna")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Client(api_key=GROQ_API_KEY)
groq_model = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

class QueryRequest(BaseModel):
    prompt: str
    database_url: str = None

def simple_sql(prompt):
    p = prompt.lower()
    if 'top' in p and 'vendor' in p:
        return 'SELECT v.name AS vendor, SUM(i."totalAmount") AS total FROM "Vendor" v JOIN "Invoice" i ON i."vendorId" = v.id GROUP BY v.name ORDER BY total DESC LIMIT 10;'
    return 'SELECT id, "invoiceRef", "invoiceDate", "totalAmount" FROM "Invoice" ORDER BY "invoiceDate" DESC LIMIT 100;'

def call_groq_with_sdk(prompt, model, retries=3):
    if not groq_client:
        raise Exception("Groq client not initialized")
    last_err = None
    for attempt in range(retries):
        try:
            completion = groq_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an assistant that outputs only SQL queries."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0
            )
            return completion.choices[0].message.content
        except Exception as e:
            last_err = e
            logger.warning("Groq call failed (attempt %s/%s): %s", attempt+1, retries, e)
            time.sleep(1 * (attempt + 1))
    raise last_err or Exception("Groq call failed")

async def exec_sql(db_url, sql):
    conn = await asyncpg.connect(dsn=db_url)
    try:
        rows = await conn.fetch(sql)
        return [dict(r) for r in rows]
    finally:
        await conn.close()

@app.post('/query')
async def query(req: QueryRequest):
    prompt = req.prompt
    db = req.database_url or os.getenv('DATABASE_URL')
    if not db: raise HTTPException(status_code=400, detail='DATABASE_URL required')
    groq_key = os.getenv('GROQ_API_KEY')
    groq_base = os.getenv('GROQ_BASE_URL') or 'https://api.groq.com/openai/v1'
    sql = None
    if groq_key and groq_client:
        try:
            s = call_groq_with_sdk(prompt, groq_model)
            s = s.strip().strip('`').strip()
            m = re.search(r'(SELECT[\s\S]+);?', s, re.IGNORECASE)
            sql = m.group(1) if m else s
        except Exception as e:
            logger.error('Groq error: %s', e)
            sql = None
    if not sql: sql = simple_sql(prompt)
    try:
        res = await exec_sql(db, sql)
        return {'sql': sql, 'results': res}
    except Exception as e:
        logger.exception("DB execution failed")
        return {'sql': sql, 'results': [], 'error': str(e)}
