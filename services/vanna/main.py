from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os, requests, asyncpg, re, json, logging, time
from typing import Optional

app = FastAPI()
logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO").upper())
logger = logging.getLogger("vanna")

class QueryRequest(BaseModel):
    prompt: str
    database_url: str = None

def simple_sql(prompt):
    p = prompt.lower()
    if 'top' in p and 'vendor' in p:
        return 'SELECT v.name AS vendor, SUM(i."totalAmount") AS total FROM "Vendor" v JOIN "Invoice" i ON i."vendorId" = v.id GROUP BY v.name ORDER BY total DESC LIMIT 10;'
    return 'SELECT id, "invoiceRef", "invoiceDate", "totalAmount" FROM "Invoice" ORDER BY "invoiceDate" DESC LIMIT 100;'

def call_groq(prompt, key, model, base, timeout=10, retries=3):
    headers = {'Authorization': f'Bearer {key}','Content-Type':'application/json'}
    url = base.rstrip('/') + '/chat/completions'
    payload = {'model': model, 'messages':[{'role':'system','content':'You are an assistant that outputs only SQL queries.'},{'role':'user','content':prompt}], 'temperature':0}
    last_err: Optional[Exception] = None
    for attempt in range(retries):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=timeout)
            r.raise_for_status()
            data = r.json()
            try:
                return data['choices'][0]['message']['content']
            except Exception:
                return json.dumps(data)
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
    groq_model = os.getenv('GROQ_MODEL') or 'mixtral-8x7b'
    groq_base = os.getenv('GROQ_BASE_URL') or 'https://api.groq.com/openai/v1'
    sql = None
    if groq_key:
        try:
            s = call_groq(prompt, groq_key, groq_model, groq_base)
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
