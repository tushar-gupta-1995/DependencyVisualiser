package main

import (
	"flag"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func GetDocumentation(filePath string) {
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, filePath, nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
	}

	methodHeaders := make(map[string]string)
	ast.Inspect(file, func(node ast.Node) bool {
		funcDecl, ok := node.(*ast.FuncDecl)
		if ok {
			funcName := funcDecl.Name.Name
			methodDocumentation := funcDecl.Doc
			var header string
			if methodDocumentation != nil {
				for _, comment := range methodDocumentation.List {
					text := strings.TrimSpace(strings.TrimPrefix(comment.Text, "//"))
					header += text + "\n"
				}
			}
			methodHeaders[funcName] = header
		}

		return true
	})

	for funcName, header := range methodHeaders {
		fmt.Printf("Function: %s\n%s\n", funcName, header)
	}

}

func GetDependency(directory string) (map[string][]string, error) {
	dependencies := make(map[string][]string)

	err := filepath.Walk(directory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		if filepath.Ext(path) != ".go" {
			return nil
		}

		fset := token.NewFileSet()
		file, err := parser.ParseFile(fset, path, nil, parser.ImportsOnly)
		if err != nil {
			return err
		}

		moduleName := filepath.Dir(path)

		var moduleDependencies []string
		for _, imp := range file.Imports {
			importPath := strings.Trim(imp.Path.Value, "\"")
			moduleDependencies = append(moduleDependencies, importPath)
		}

		dependencies[moduleName] = moduleDependencies

		return nil
	})

	if err != nil {
		return nil, err
	}

	for key, dep := range dependencies {
		fmt.Println(key + ":")
		fmt.Print(dep)
	}

	return dependencies, nil
}

// Windows: .\DependencyVisualiser.exe -trigger-point="documentation"
func main() {
	trigger := flag.String("trigger-point", "dependency", "trigger dependency vs trigger getting documentation")
	directory := flag.String("dir", "doc", "add documentation")
	flag.Parse()
	fmt.Println(*trigger)

	switch *trigger {
	case "dependency":
		GetDependency(*directory)
	case "documentation":
		GetDocumentation(*directory)
	default:
		fmt.Println("Invalid trigger option: " + *trigger)
	}

}
