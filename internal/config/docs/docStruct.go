package docs

type DocStructure struct{
	Text string
	Arguments map[string]DocArg
	Attributes map[string]string
	Blocks map[string]DocBlock
}
type DocArg struct{
	Req bool
	Bonus string
	Text string
}
type DocBlock struct{
	Text string
	Arguments map[string]DocArg
}