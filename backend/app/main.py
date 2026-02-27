from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "crypto-sim backend is running"}