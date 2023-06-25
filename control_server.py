import io
import json
import os
import re
import shlex
import subprocess

from flask import Flask, jsonify, request, send_file, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Provide  the directory path you want to traverse
# directory_path = 'C:\\Users\\gupta\\OneDrive\\Documents\\test\\'
# main_dir = 'C:\\Users\\gupta\\OneDrive\\Documents\\test'
main_dir = '/testfolder'
test_dir = main_dir
current_test_dir =  main_dir

# pattern = 'import\(\".+\)'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test_documentation_generator', methods=['GET'])
def new_page():
    print("rendering test case doc page")
    return render_template('test_documentation_generator.html')

def extract_pattern(regex, text):
    matches = re.findall(regex, text)
    return matches


@app.route('/api/adjacency-list', methods=['GET'])
def get_adjacency_list():
    go_binary_path = "/app/DependencyVisualiser"
    folder_in_analysis = main_dir + "/"+ request.args.get('folder')
    print("folder in analysis: " + folder_in_analysis)
    command = [go_binary_path, "-trigger-point", "dependency", "-dir", folder_in_analysis]
    print("Executing command:", " ".join(shlex.quote(arg) for arg in command))
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    stdout, stderr = process.communicate()
    print(stdout.decode())
    print(stderr.decode())
    output = json.loads(stdout.decode())
    return output

@app.route('/api/directories', methods=['GET'])
def get_directories():
    # Get a list of all items (files and folders) in the directory
    items = os.listdir(main_dir)

    # Filter only the directories from the list
    child_folders = [item for item in items if os.path.isdir(os.path.join(main_dir, item))]

    dir_str = {}
    dir_str['name']=child_folders

    return jsonify(dir_str)

if __name__ == '__main__':
    print("port 5000")
    app.run(host='0.0.0.0', port=5000)

