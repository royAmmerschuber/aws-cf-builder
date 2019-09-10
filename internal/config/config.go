package config

import (
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
)

type Config struct{
	Name string
	Comment string
	Path string
	Identifier string
	Attributes map[string]attribute.Attribute
	Comp map[string]attribute.Attribute
	IdentAttr []string
	Children []*Config
	Provides bool
	Inherits map[string]InheritedProperty
}
type InheritedProperty struct{
	Resource string
	Attribute string
}

type FileConfig struct{
	Resource *Config
	DataSource *Config
	Interfaces []*attribute.Interface
}

type ProviderConfig struct{
	Conf Config
	Interfaces []*attribute.Interface
}