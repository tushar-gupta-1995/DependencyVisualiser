import io
import os
import re

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

main_dir = 'C:\\Users\\gupta\\OneDrive\\Documents\\test'
test_dir = main_dir

def traverse_directory(directory):
    print(directory)
    adjList = {}
    pattern = r'(?<=import\s\()(.*)'
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            print(file)
            dependency_list = []
            with open(file_path, 'r') as f:
                content = f.read().replace("\n\t", "")
                print("content: ")
                print(content)
                content = extract_pattern(pattern, content)
                print("content: ")
                print(content)
                for dependency in content:
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
    return adjList


def extract_pattern(regex, text):
    matches = re.findall(regex, text)
    return matches


@app.route('/api/adjacency-list', methods=['GET'])
def get_adjacency_list():
    folder_in_analysis = request.args.get('folder')
    adjList=traverse_directory(main_dir +"\\"+ folder_in_analysis)
    print(adjList)
    return jsonify(adjList)


@app.route('/api/directories', methods=['GET'])
def get_directories():
    items = os.listdir(main_dir)

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
    file_full_path=test_dir+"\\"+test_file
    content_map={}
    with open(file_full_path, 'r') as f:
        content = f.read()
    content_map['content'] = content
    return jsonify(content_map)

@app.route('/api/extract_comments', methods=['GET'])
def extract_commnts():
    test_code = request.args.get('test_code')
    test_code = re.sub(r"\s{4}", "\n", test_code)
    get_all_functions_regex = "func (.*(?=(\()))"
    all_methods_list = get_list_matches(get_all_functions_regex,test_code)
    print(all_methods_list)
    method_logic_map = {}
    for method in all_methods_list:
        modified_regex = r"func\s+" + re.escape(method) + r"\b[\s\S]*?(?=\nfunc|\Z)"
        method_logic = re.findall(modified_regex, test_code)
        accumulated_logic = ""
        for logic in method_logic:
            accumulated_logic=accumulated_logic+logic
        method_logic_map[method] = accumulated_logic
    regex_extract_comments = r"// step \d+((.|\n\s*//)*)"
    comments = ""
    for method in all_methods_list:
        logic = method_logic_map[method]
        comment_list = re.findall(regex_extract_comments, logic)
        i = 1;
        for comment in comment_list:
            comment = comment[0]
            comment = comment.replace(":", "").replace("//", "")
            comment = "Step " + str(i) + ": " + str(comment)
            comments = comments + comment + "\n"
            i = i + 1
    file_stream = io.BytesIO()
    file_stream.write(comments.encode())
    file_stream.seek(0)
    return send_file(file_stream, mimetype='text/markdown', as_attachment=True, download_name='example.md')

@app.route('/download_markdown')
def download_markdown():
    content = 'this is my file'
    file_stream = io.BytesIO()
    file_stream.write(content.encode())
    file_stream.seek(0)

    return send_file(file_stream, mimetype='text/markdown', as_attachment=True, download_name='example.md')


def get_list_matches(regex,text):
    matches = re.findall(regex, text)
    result_list = []
    for match in matches:
        result_list.append(match[0])
    return result_list
