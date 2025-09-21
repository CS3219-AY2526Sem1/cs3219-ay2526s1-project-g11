// constants.go
package main

// Difficulty levels for LeetCode questions
type Difficulty string

const (
	Easy   Difficulty = "easy"
	Medium Difficulty = "medium"
	Hard   Difficulty = "hard"
)

// LeetCode topics
type Topic string

const (
	Array              Topic = "array"
	HashTable          Topic = "hash-table"
	TwoPointers        Topic = "two-pointers"
	SlidingWindow      Topic = "sliding-window"
	Stack              Topic = "stack"
	Queue              Topic = "queue"
	Tree               Topic = "tree"
	Graph              Topic = "graph"
	DynamicProgramming Topic = "dynamic-programming"
	Backtracking       Topic = "backtracking"
	Greedy             Topic = "greedy"
	BinarySearch       Topic = "binary-search"
)
