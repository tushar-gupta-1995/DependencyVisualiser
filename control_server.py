import io
import os
import re
import subprocess

from flask import Flask, jsonify, request, send_file, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Provide the directory path you want to traverse
# directory_path = 'C:\\Users\\gupta\\OneDrive\\Documents\\test\\'
# main_dir = 'C:\\Users\\gupta\\OneDrive\\Documents\\test'
main_dir = '/testfolder'
test_dir = main_dir
current_test_dir =  main_dir

# pattern = 'import\(\".+\)'

# Define the adjacency list data
adjacency_list = {
    'modes.go': ['modes_d.go', 'modes_e.go'],
    'modes_d.go': ['C'],
    'modes_e.go': ['A', 'B']
}

@app.route('/')
def index():
    return render_template('index.html')

def traverse_directory(directory):
    print(directory)
    adjList = {}
    # pattern = '(?<=import\s\(\n\t)(\d|\D|\n)*?\)'
    # pattern = r'(?<=import\s\(\n\t)(\d|\D|\n)*?\)'
    pattern = r'(?<=import\s\()(.*)'
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            print(file)
            dependency_list = []
            # Perform file reading operations on file_path
            with open(file_path, 'r') as f:
                content = f.read().replace("\n\t", "")
                print("content: ")
                print(content)
                # content = content.replace("\n", "")
                # content = content.replace("\t", "")
                # content = content.replace(" ", "")
                content = extract_pattern(pattern, content)
                print("content: ")
                print(content)
                for dependency in content:
                    # dependency = dependency.replace("import(","")
                    dependency = dependency.replace(")", "")
                    dependency = dependency.split('"')
                    print("dependency: " )
                    print(dependency)
                    for dep in dependency:
                        if dep!='//_ ' and dep!='':
                            dep=extract_pattern(r'[^/]+$',dep)[0]
                            print(dep)
                            dependency_list.append(dep)
                            adjList[dep] = ['nil']
                    file_without_extension = file.split('.')[0]
                    adjList[file_without_extension] = dependency_list
                    # print(dependency)
    print(adjList)
    return adjList
                # print(content)  # Replace this with your desired file processing logic


def extract_pattern(regex, text):
    matches = re.findall(regex, text)
    return matches


@app.route('/api/adjacency-list', methods=['GET'])
def get_adjacency_list():
    folder_in_analysis = request.args.get('folder')
    adjList=traverse_directory(main_dir +'/'+ folder_in_analysis)
    print(adjList)
    return jsonify(adjList)


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
    test_dir = main_dir + "\\" + folder_to_test
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
    go_binary_path = "C:\\Users\\gupta\\DependencyVisualiser\\DependencyVisualiser.exe"

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

