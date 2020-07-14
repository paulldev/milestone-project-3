import os
import pymysql
from flask import Flask, render_template, url_for
print(os.environ)
app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(host=os.environ.get('IP'),
            port=int(os.environ.get('PORT')),
            debug=True)
