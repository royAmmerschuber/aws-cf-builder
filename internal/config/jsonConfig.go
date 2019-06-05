package config
type jsonConfigGeneratable struct{
	Alias string
	NameParts []string
	ChildResources map[string][]string
	Provides string
	Inherits map[string][]string
}
type jsonConfig struct{
	Resources map[string]jsonConfigGeneratable
	Datasources map[string]jsonConfigGeneratable
}