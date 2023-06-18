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

@app.route('/api/set_directory', methods=['GET'])
def prepare_main_directory():
    print(request.args.get('dir'))
    global main_dir
    main_dir = request.args.get('dir')
    return main_dir

@app.route('/api/set_test_directories', methods=['GET'])
def set_test_directories():
    global test_dir
    folder_to_test = request.args.get('test_dir')
    test_dir = main_dir + "/" + folder_to_test
    print(test_dir)
    return test_dir

@app.route('/api/get_test_directories', methods=['GET'])
def get_test_directories():
    directory = test_dir
    test_files_list = []
    dir_str = {}
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_name_without_extension = file.split('.')[0]
            print(file_name_without_extension)
            if file_name_without_extension.endswith("test"):
                test_files_list.append(file)
    dir_str['structure'] = test_files_list
    return jsonify(dir_str)

@app.route('/api/get_content', methods=['GET'])
def extract_content_and_display():
    test_file = request.args.get('test_file').replace("\"", "")
    file_full_path = ''
    for root, dirs, files in os.walk(test_dir):
        if test_file in files:
            file_full_path = os.path.join(root, test_file)
            break
    content_map = {}
    global current_test_dir
    current_test_dir = file_full_path
    with open(file_full_path, 'r') as f:
        content = f.read()
    content_map['content'] = content
    return jsonify(content_map)

@app.route('/api/extract_comments', methods=['GET'])
def extract_commnts():
    # go_binary_path = "C:\\Users\\gupta\\DependencyVisualiser\\DependencyVisualiser.exe"
    go_binary_path = "/app/DependencyVisualiser"
    command = [go_binary_path, current_test_dir]

    result = subprocess.run(command, capture_output=True, text=True)

    print("Output:", result.stdout)

    doc = result.stdout
    file_stream = io.BytesIO()
    file_stream.write(doc.encode())
    file_stream.seek(0)
    return send_file(file_stream, mimetype='text/markdown', as_attachment=True, download_name='doc.md')

@app.route('/download_markdown')
def download_markdown():
    content = 'this is my file'

    # Create an in-memory file-like object
    file_stream = io.BytesIO()
    file_stream.write(content.encode())
    file_stream.seek(0)

    return send_file(file_stream, mimetype='text/markdown', as_attachment=True, download_name='example.md')


def get_list_matches(regex,text):
    matches = re.findall(regex, text)
    result_list = []
    for match in matches:
        result_list.append(match[0])
        # print(match[0])
    return result_list

def get_list_matches_all(regex,text):
    matches = re.findall(regex, text)
    result_list = []
    for match in matches:
        result_list.append(match)
        # print(match[0])
    return result_list

if __name__ == '__main__':
    print("port 5000")
    app.run(host='0.0.0.0', port=5000)

