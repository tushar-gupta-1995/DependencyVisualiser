import os
import re

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Provide the directory path you want to traverse
directory_path = 'C:\\Users\\gupta\\OneDrive\\Documents\\test\\'
main_dir = 'C:\\Users\\gupta\\OneDrive\\Documents\\test'

pattern = 'import\(\".+\)'

# Define the adjacency list data
adjacency_list = {
    'modes.go': ['modes_d.go', 'modes_e.go'],
    'modes_d.go': ['C'],
    'modes_e.go': ['A', 'B']
}


def traverse_directory(directory):
    for root, dirs, files in os.walk(directory):
        adjList = {}
        for file in files:
            file_path = os.path.join(root, file)
            print(file)
            # Perform file reading operations on file_path
            with open(file_path, 'r') as f:
                content = f.read()
                content = content.replace("\n", "")
                content = content.replace("\t", "")
                content = content.replace(" ", "")
                content = extract_pattern(pattern, content)

                for dependency in content:
                    dependency = dependency.replace("import(","")
                    dependency = dependency.replace(")", "")
                    dependency = dependency.split('"')
                    dependency_list = []
                    for dep in dependency:
                        if dep != '':
                            dependency_list.append(dep)
                    file_without_extension = file.split('.')[0]
                    adjList[file_without_extension] = dependency_list
                    print(adjList)
                    # print(dependency)
    return adjList
                # print(content)  # Replace this with your desired file processing logic


def extract_pattern(regex, text):
    matches = re.findall(regex, text)
    return matches


@app.route('/api/adjacency-list', methods=['GET'])
def get_adjacency_list():
    folder_in_analysis = request.args.get('folder')
    adjList=traverse_directory(directory_path + folder_in_analysis)
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

if __name__ == '__main__':
    app.run()
