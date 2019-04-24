package config

import (
	"github.com/hashicorp/terraform/helper/schema"
)
func Generate(name string,identifier string,schem map[string]*schema.Schema) Config{
	identAttr:=make([]string,0)
	attr,comp:=schemaToAttributes(schem)
	if _,ok:=attr["name"];ok{
		identAttr=append(identAttr,"name")
	}
	return Config{
		Name:name,
		Identifier:identifier,
		Attributes:attr,
		Comp:comp,
		IdentAttr:identAttr,
	}
}