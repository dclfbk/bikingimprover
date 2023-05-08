FROM python:3.11

WORKDIR /app
COPY ./docker/setup_gamification_engine/ .
RUN pip install -r requirements.txt

CMD /usr/local/bin/python main.py
