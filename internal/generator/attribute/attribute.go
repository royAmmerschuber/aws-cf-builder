
package attribute
type Attribute interface{
	GenerateParameters() string
	GenerateSetter() string
	GenerateGenerate() string
	GenerateInterfaces() string
	GenerateCheck() string
	GenerateInterfaceProp() string
}