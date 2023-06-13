package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"log"
	"os"
	"strings"
)

func main() {
	// Specify the path to your Go file
	// filePath := "C:\\Users\\gupta\\DependencyVisualiser\\ExtractGoDocumentation.go"
	filePath := os.Args[1]

	// Create a new file set and parse the Go file
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, filePath, nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
	}

	// Traverse the AST and extract method headers
	methodHeaders := make(map[string]string)
	ast.Inspect(file, func(node ast.Node) bool {
		// Look for function declarations
		funcDecl, ok := node.(*ast.FuncDecl)
		if ok {
			// Extract function name
			funcName := funcDecl.Name.Name

			// Extract the comment group associated with the function
			commentGroup := funcDecl.Doc

			// Extract method header from the comment
			var header string
			if commentGroup != nil {
				for _, comment := range commentGroup.List {
					text := strings.TrimSpace(strings.TrimPrefix(comment.Text, "//"))
					header += text + "\n"
				}
			}

			// Store the method header with the function name
			methodHeaders[funcName] = header
		}

		return true
	})

	// Print the method headers
	for funcName, header := range methodHeaders {
		fmt.Printf("Function: %s\n%s\n", funcName, header)
		// Convert the dictionary to a JSON string
		// jsonData, err := json.Marshal(methodHeaders)
		// if err != nil {
		// 	fmt.Println("Error:", err)
		// 	return
		// }

		// // Print the JSON string
		// fmt.Println(string(jsonData))
		// }
	}
}
