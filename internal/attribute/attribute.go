
package attribute
type Attribute interface{
	GenerateParameters() string
	GenerateSetter() string
	GenerateGenerate() string
	GetInterfaces() []*Interface
	GenerateCheck() string
	GenerateInterfaceProp() string
	Equals(a Attribute) bool
}