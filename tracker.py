# все импорты
import os
import datetime as dt
import sqlite3
from collections import defaultdict
from lib.hamster.db import Storage

from pprint import pprint

from flask import Flask, request, session, g, redirect, url_for, render_template, flash, json

from lib.hamster import parse_fact

# создаём наше маленькое приложение :)
app = Flask(__name__)
app.config.from_object(__name__)

# Загружаем конфиг по умолчанию и переопределяем в конфигурации часть
# значений через переменную окружения
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'data/hamster.db'),
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='admin',
    TRAP_BAD_REQUEST_ERRORS=False
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

def connect_db():
    """Соединяет с указанной базой данных."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def get_db():
    """Если ещё нет соединения с базой данных, открыть новое - для
    текущего контекста приложения
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


@app.route('/')
def show_entries():
    now = dt.datetime.now()

    interval = request.args.get('interval')
    dateFrom = now - dt.timedelta(days=13)
    dateTo = now - dt.timedelta(days=12)

    if interval != None:
        interval = interval.split('-')
        if len(interval) == 2:
            dateFrom = dt.datetime.strptime(interval[0], "%d.%m.%Y")
            dateTo = dt.datetime.strptime(interval[1], "%d.%m.%Y")
        else:
            dateFrom = dt.datetime.strptime(interval[0], "%d.%m.%Y")
            dateTo = dateFrom #+ dt.timedelta(days=1)


    pprint([dateFrom, dateTo])

    storage = Storage()

    last_entries = storage.get_facts(dateFrom, dateTo, "")
    pprint(last_entries)
    totals = defaultdict(lambda: defaultdict(dt.timedelta))
    for fact in last_entries:
        for key in ('category', 'activity_id'):
            totals[key][fact[key]] += fact['delta']

        for tag in fact['tags']:
            totals["tag"][tag] += fact['delta']

    for key, group in totals.items():
        totals[key] = sorted(group.items(), key=lambda x: x[1], reverse=True)


    return render_template('show_entries.html', entries=last_entries, totals=totals)


@app.route('/api/tasks')
def get_tasks():
    now = dt.datetime.now()

    interval = request.args.get('interval')
    dateFrom = now - dt.timedelta(days=13)
    dateTo = now - dt.timedelta(days=12)

    if interval != None:
        interval = interval.split('-')
        if len(interval) == 2:
            dateFrom = dt.datetime.strptime(interval[0], "%d.%m.%Y")
            dateTo = dt.datetime.strptime(interval[1], "%d.%m.%Y")
        else:
            dateFrom = dt.datetime.strptime(interval[0], "%d.%m.%Y")
            dateTo = dateFrom  # + dt.timedelta(days=1)

    storage = Storage()

    last_entries = storage.get_facts(dateFrom, dateTo, "")

    for k, item in enumerate(last_entries):
        last_entries[k]['delta'] = round(item['delta'].seconds/3600, 2)
        last_entries[k]['date'] = item['date'].strftime('%d.%m.%Y')
        last_entries[k]['start_time'] = item['start_time'].strftime('%d.%m.%Y %H:%M:%S')
        last_entries[k]['end_time'] = item['end_time'].strftime('%d.%m.%Y %H:%M:%S')


    return json.dumps(last_entries, ensure_ascii=False)


@app.route('/add', methods=['POST'])
def add_entry():
    # if not session.get('logged_in'):
    #     abort(401)
    # db = get_db()
    # db.execute('insert into activities (name) values (?)',
    #             [request.form['name']])
    # db.commit()
    # flash('New entry was successfully posted')

    fact = parse_fact(request.form['name'])

    pprint(fact)

    return render_template('show_entries.html', entries={})
    # return redirect(url_for('show_entries'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_entries'))


if __name__ == '__main__':
    app.run()