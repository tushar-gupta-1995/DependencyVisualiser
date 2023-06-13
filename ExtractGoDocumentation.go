package main

/*
   fibonacciDP calculates the Fibonacci number at position n using dynamic programming.
   It returns the Fibonacci value at the specified position.

   Parameters:
       n (int): The position of the Fibonacci number to calculate.

   Returns:
       int: The Fibonacci value at position n.
*/
func fibonacciDP(n int) int {
	if n <= 1 {
		return n
	}

	fib := make([]int, n+1)
	fib[0] = 0
	fib[1] = 1

	for i := 2; i <= n; i++ {
		fib[i] = fib[i-1] + fib[i-2]
	}

	return fib[n]
}
