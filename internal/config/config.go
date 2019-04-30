package config

import (
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
)

type Config struct{
	Name string
	Identifier string
	Attributes map[string]attribute.Attribute
	Comp map[string]attribute.Attribute
	IdentAttr []string
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