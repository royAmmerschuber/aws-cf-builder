package config
type jsonConfigGeneratable struct{
	Alias string
	NameParts []string
	ChildResources map[string][]string
	Provides bool
	Inherits map[string]InheritedProperty
}

type jsonConfig struct{
	Resources map[string]jsonConfigGeneratable
	Datasources map[string]jsonConfigGeneratable
}