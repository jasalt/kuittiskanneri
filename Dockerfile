FROM python:2.7
WORKDIR /code

COPY requirements.txt /code/
RUN pip install -r requirements.txt

VOLUME /code

CMD ["python", "run.py"]
