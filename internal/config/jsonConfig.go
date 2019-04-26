package config
type jsonConfigGeneratable struct{
	NameParts []string
	ChildResources map[string][]string
}
type jsonConfig struct{
	Resources map[string]jsonConfigGeneratable
	Datasources map[string]jsonConfigGeneratable
}