package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
)

func GetDependency(directory string) (map[string][]string, error) {
	dependencies := make(map[string][]string)

	err := filepath.Walk(directory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if filepath.Ext(path) != ".go" {
			return nil
		}

		fset := token.NewFileSet()
		file, err := parser.ParseFile(fset, path, nil, parser.ImportsOnly)
		// fmt.Println(path, info.Size())
		if err != nil {
			return err
		}

		var moduleDependencies []string
		// each module has at least a nil dependency
		moduleDependencies = append(moduleDependencies, "nil")

		for _, imp := range file.Imports {
			importPath := strings.Trim(imp.Path.Value, "\"")
			moduleDependencies = append(moduleDependencies, importPath)

			// each dependency itself is a key to register as a mapping in graph, so check if it exists else add it as a key
			if _, exists := dependencies[importPath]; !exists {
				dependencies[importPath] = []string{"nil"}
			}
		}

		dependencies[path] = moduleDependencies

		return nil
	})

	if err != nil {
		return nil, err
	}

	// for key, dep := range dependencies {
	// 	fmt.Println(key + ":")
	// 	fmt.Print(dep)
	// }

	jsonData, err := json.Marshal(dependencies)
	if err != nil {
		return nil, err
	}

	fmt.Println(string(jsonData))
	return dependencies, nil
}

// Windows: .\DependencyVisualiser.exe -trigger-point="documentation"
func main() {
	trigger := flag.String("trigger-point", "dependency", "trigger dependency vs trigger getting documentation")
	directory := flag.String("dir", "doc", "add documentation")
	flag.Parse()

	switch *trigger {
	case "dependency":
		GetDependency(*directory)
	default:
		fmt.Println("Invalid trigger option: " + *trigger)
	}

}
