package config

import (
	"fmt"

	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/config/docs"
	"github.com/hashicorp/terraform/helper/schema"
	"github.com/iancoleman/strcase"

)

func schemaToAttributes(s map[string]*schema.Schema, doc *docs.DocStructure, blockdoc *docs.DocBlock) (map[string]attribute.Attribute,map[string]attribute.Attribute){
	dArgs:=doc.Arguments
	dAttr:=doc.Attributes
	dBlocks:=doc.Blocks
	if blockdoc!=nil{
		dAttr=map[string]string{}
		dArgs=blockdoc.Arguments
	}
	out:=make(map[string]attribute.Attribute,0)
	comp:=make(map[string]attribute.Attribute,0)
	for k,v :=range s{
		if v.Removed!=""{
			continue
		}
		switch{
			case v.Type==schema.TypeBool || v.Type==schema.TypeString || v.Type==schema.TypeFloat || v.Type==schema.TypeInt:{
				//TODO int type
				//TODO deep computed
				
				attr:=attribute.SimpleAttribute{
					Name:k,
					Required:v.Required,
					TypeString:schemaTypeToTs(v.Type),
				}
				if v.Optional||v.Required{
					if d,ok:=dArgs[k];ok{
						attr.Comment=d.Text
						attr.CommentBonus=d.Bonus
					}
					out[k]=attr
				}else if v.Computed{
					if d,ok:=dAttr[k];ok{
						attr.Comment=d
					}
					comp[k]=attr
				}else{
					fmt.Println("\rnon required/optional/computed attribute:",k)
				}
			}
			case v.Type==schema.TypeList||v.Type==schema.TypeSet:{
				switch e:=v.Elem.(type){
					case *schema.Schema:{
						if e.Type==schema.TypeBool || e.Type==schema.TypeString || e.Type==schema.TypeFloat || e.Type==schema.TypeInt{
							//TODO int type
							attr:=attribute.ArrayAttribute{
								Name:k,
								Required:v.Required,
								TypeString:schemaTypeToTs(e.Type),
							}
							if v.Optional||v.Required{
								if d,ok:=dArgs[k];ok{
									attr.Comment=d.Text
									attr.CommentBonus=d.Bonus
								}
								out[k]=attr
							}else if v.Computed{
								if d,ok:=dAttr[k];ok{
									attr.Comment=d
								}
								comp[k]=attr
							}else{
								panic(fmt.Errorf("%s: non required/optional/computed attribute",k))
							}
						}else {
							panic(fmt.Errorf("%s: array has non simple schema Elem",k))
						}
					}
					case *schema.Resource:{
						var doc *docs.DocBlock
						if d,ok:=dBlocks[k];ok{
							doc=&d
						}
						attrs,_:=schemaToAttributes(e.Schema,&docs.DocStructure{},doc)
						attr := attribute.AdvancedAttribute{
							Max:v.MaxItems,
							Min:v.MinItems,
							Name:k,
							Required:v.Required,
							Interface:&attribute.Interface{
								Name:strcase.ToCamel(k),
								Attributes:attrs,
							},
							IsMap:false,
						}

						if doc!=nil{
							attr.Comment=doc.Text
						}

						if v.Required||v.Optional{
							out[k]=attr
						}else if v.Computed{
							comp[k]=attr
						}else {
							panic(fmt.Errorf("%s: non required/optional/computed attribute",k))
						}
					}
					default:{
						panic(fmt.Errorf("%s: arrays elem type(%T) has non *Schema/*Resource Elem",k,e))
					}
				}
			}
			case v.Type==schema.TypeMap:{
				switch e:=v.Elem.(type){
					case *schema.Schema:{
						if e.Type==schema.TypeBool || e.Type==schema.TypeString || e.Type==schema.TypeFloat || e.Type==schema.TypeInt{
							//TODO int type
							attr:=attribute.MapAttribute{
								Name:k,
								Required:v.Required,
								TypeString:schemaTypeToTs(e.Type),
							}
							if v.Optional||v.Required{
								if d,ok:=dArgs[k];ok{
									attr.Comment=d.Text
									attr.CommentBonus=d.Bonus
								}
								out[k]=attr
							}else if v.Computed{
								if d,ok:=dAttr[k];ok{
									attr.Comment=d
								}
								comp[k]=attr
							}else{
								fmt.Println("\rnon required/optional/computed attribute:",k)
							}
						}else {
							panic(fmt.Errorf("%s: map has non simple schema Elem",k))
						}
					}
					case *schema.Resource:{
						var doc *docs.DocBlock
						if d,ok:=dBlocks[k];ok{
							doc=&d
						}
						attrs,_:=schemaToAttributes(e.Schema,&docs.DocStructure{},doc)
						attr := attribute.AdvancedAttribute{
							Max:v.MaxItems,
							Min:v.MinItems,
							Name:k,
							Required:v.Required,
							Interface:&attribute.Interface{
								Name:strcase.ToCamel(k),
								Attributes:attrs,
							},
							IsMap:true,
						}
						
						if doc!=nil{
							attr.Comment=doc.Text
						}

						if v.Required||v.Optional{
							out[k]=attr
						}else if v.Computed{
							comp[k]=attr
						}else {
							panic(fmt.Errorf("%s: map has non simple schema Elem",k))
						}
					}
					default:{
						//TODO int type
						attr:=attribute.MapAttribute{
							Name:k,
							Required:v.Required,
							TypeString:schemaTypeToTs(schema.TypeString),
						}
						if v.Optional||v.Required{
							out[k]=attr
						}else if v.Computed{
							comp[k]=attr
						}else{
							fmt.Println("\rnon required/optional/computed attribute:",k)
						}
					}
				}
			}
			default:{
				panic(fmt.Errorf("%s: unexpected type found",k))
			}
		}
	}
	return out,comp
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