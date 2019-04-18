package generator

import (
	"fmt"

	"github.com/hashicorp/terraform/terraform"
	"github.com/hashicorp/terraform/config/configschema"
	"github.com/hashicorp/terraform/helper/schema"
	"github.com/iancoleman/strcase"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/generator/attribute"
	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
)
var Path string
var GeneralPath string ="../../js/general/"

func Generate(name string, provider interface{}) {
	switch v:=provider.(type){
		case schema.Provider: {
			fmt.Println("using Schema")
			attributes:= schemaToAttributes(v.Schema)
			generateProvider(name, attributes)
		}
		/* case terraform.ResourceProvider:{
			fmt.Println("Provider: " + name)
			schem := getSchema(v)
			fmt.Printf("Resources: %v\n",len(schem.ResourceTypes))
			fmt.Printf("DataSources: %v\n",len(schem.DataSources))
			attributes:=blockToAttributes(*schem.Provider)
			generateProvider(name , attributes)
		} */
	}
	
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
	schem,_:= p.GetSchema(&terraform.ProviderSchemaRequest{
		DataSources:dNames,
		ResourceTypes:rNames,
	})
	return schem
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
func schemaToAttributes(s map[string]*schema.Schema) []attribute.Attribute{
	out:=make([]attribute.Attribute,0)
	for k,v :=range s{
		switch{
			case v.Type==schema.TypeBool || v.Type==schema.TypeString || v.Type==schema.TypeFloat || v.Type==schema.TypeInt:{
				//TODO int type
				out=append(out,attribute.SimpleAttribute{
					Name:k,
					Required:v.Required,
					TypeString:schemaTypeToTs(v.Type),
				})
			}
			case v.Type==schema.TypeList||v.Type==schema.TypeSet:{
				switch e:=v.Elem.(type){
					case schema.Schema:{
						if e.Type==schema.TypeBool || e.Type==schema.TypeString || e.Type==schema.TypeFloat || e.Type==schema.TypeInt{
							//TODO int type
							out=append(out,attribute.ArrayAttribute{
								Name:k,
								Required:v.Required,
								TypeString:schemaTypeToTs(e.Type),
							})
						}else {
							panic(fmt.Errorf("array has non simple schema Elem"))
						}
					}
					case schema.Resource:{
						
						out=append(out,attribute.AdvancedAttribute{
							Max:v.MaxItems,
							Min:v.MinItems,
							Name:k,
							Required:v.Required,
							InterfaceName:strcase.ToCamel(k),
							Attributes:schemaToAttributes(e.Schema),
						});
					}
					default:{
						panic(fmt.Errorf("array has non Schema/Resource Elem"))
					}
				}
			}
		}
	}
	return out
}
func schemaTypeToTs(t schema.ValueType) string{
	switch t{
		case schema.TypeBool:{
			return "boolean"
		}
		case schema.TypeString:{
			return "string"
		}
		case schema.TypeFloat:{
			return "number"
		}
		case schema.TypeInt:{
			return "number"
		}
	}
	panic("non basic Type")
}