package generator

import (
	"fmt"

	"github.com/hashicorp/terraform/terraform"
	"github.com/hashicorp/terraform/config/configschema"
	"github.com/iancoleman/strcase"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/generator/attribute"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
)
var Path string
var GeneralPath string ="../../js/general/"

func Generate(name string, provider terraform.ResourceProvider) {
	
	fmt.Println("Provider: " + name)
	schema := getSchema(provider)
	fmt.Printf("Resources: %v\n",len(schema.ResourceTypes))
	fmt.Printf("DataSources: %v\n",len(schema.DataSources))
	generateProvider(name , schema.Provider)
}

func getSchema(p terraform.ResourceProvider) *terraform.ProviderSchema{
	rNames := make([]string,0)
	hasSchema:=false
	for _,r := range p.Resources() {
		if r.SchemaAvailable{
			rNames=append(rNames,r.Name)
			hasSchema=true
		}
	}
	dNames:=make([]string,0)
	for _,d := range p.DataSources(){
		if d.SchemaAvailable{
			dNames=append(dNames,d.Name)
			hasSchema=true
		}
	}
	if !hasSchema{
		panic(fmt.Errorf("provider has no Schema"))
	}
	schema,_:= p.GetSchema(&terraform.ProviderSchemaRequest{
		DataSources:dNames,
		ResourceTypes:rNames,
	})
	return schema
}

func blockToAttributes(s configschema.Block) []attribute.Attribute{
	out :=make([]attribute.Attribute,0)
	for k,v :=range s.Attributes{
		switch{
			case v.Type.IsPrimitiveType():{
				out=append(out,attribute.SimpleAttribute{
					Name:k,
					Required:v.Required,
					TypeString:u.CtyToTsType(v.Type),
				})
			}
			case v.Type.IsSetType() || v.Type.IsListType():{
				out=append(out,attribute.ArrayAttribute{
					Name:k,
					Required:v.Required,
					TypeString:u.CtyToTsType(v.Type.ElementType()),
				})
			}
		}
	}
	for k,v :=range s.BlockTypes{
		
		out=append(out,attribute.AdvancedAttribute{
			InterfaceName:strcase.ToCamel(k),
			Name:k,
			Required:v.MinItems>0,
			Attributes:blockToAttributes(v.Block),
		})
	}
	return out
}
