#!/bin/bash

. .venv/bin/activate

cd code

python manage.py makemigrations --no-input
python manage.py migrate --no-input
python manage.py collectstatic --no-input

if [ $DEBUG = 1 ]; then
    exec python manage.py runserver 0.0.0.0:8000
else
    exec gunicorn mysite.wsgi:application --bind 0.0.0.0:8000
fi
