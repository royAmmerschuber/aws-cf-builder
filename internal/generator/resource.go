package generator

import (
	"os"
	"fmt"
	"path/filepath"

	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/config"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/attribute"
	"github.com/iancoleman/strcase"
)

func generateResource(folderPath string,config config.Config){
	f,err := os.Create(filepath.Join(folderPath,strcase.ToLowerCamel(config.Name)+".ts"))
	if err!=nil{
		panic(err)
	}
	defer f.Close()
	className:=strcase.ToCamel(config.Name)
	u.TryWrite(f,
		"import { SMap, ResourceError } from '../../"+GeneralPath+"general'",
		"import { Resource } from '../../"+GeneralPath+"resource'",
		"import { Module } from '../../"+GeneralPath+"module'",
		"import { Field, ReferenceField } from '../../"+GeneralPath+"field'",
	)
	u.TryWrite(f,
		"export class "+className+" extends Resource{",
		"    protected readonly resourceIdentifier='"+config.Identifier+"'",
		"    //#region Parameters",
	)
	for _,v :=range config.Attributes{
		u.TryWrite(f,u.Indent(1,v.GenerateParameters()))
	}
	u.TryWrite(f,
		"    //#endregion",
		"",
		"    readonly d={",
	)
	for _,v := range config.Attributes{
		u.TryWrite(f,u.Indent(2,v.GenerateRef()))
	}
	for _,v :=range config.Comp{
		u.TryWrite(f,u.Indent(2,v.GenerateRef()))
	}
	u.TryWrite(f,
		"    };",
		"",
		"    constructor(",
	)
	for _,v := range config.IdentAttr{
		if a,ok:=config.Attributes[v].(attribute.SimpleAttribute);ok{
			u.TryWrite(f,"        "+strcase.ToLowerCamel(a.Name)+":Field<"+a.TypeString+">")
		}else{
			panic(fmt.Errorf("%s: non simple IdentAttr",config.Name))
		}
	}
	u.TryWrite(f,
		"    ){",
		"        super(1)",
	)
	for _,v :=range config.IdentAttr{
		a:=config.Attributes[v].(attribute.SimpleAttribute)
		n:=strcase.ToLowerCamel(a.Name)
		u.TryWrite(f,"        this._"+n+"="+n+";")
	}
	u.TryWrite(f,
		"    }",
		"",
		"    //#region simpleResources",
	)
	for _,v :=range config.Attributes{
		u.TryWrite(f,u.Indent(1,v.GenerateSetter()))
	}
	u.TryWrite(f,
		"    //#endregion",
		"",
		"    //#region resource Functions",
	)
	u.TryWrite(f,
		"    protected checkValid(){",
		"        const out:SMap<ResourceError>={};",
		"        const errors:string[]=[];",
	)
	for _,v:= range config.Attributes{
		if check:=v.GenerateCheck(); check!=""{
			u.TryWrite(f,u.Indent(2,check))
		}
	}
	u.TryWrite(f,
        "        if(errors.length){",
        "            out[this.stacktrace]={",
        "                errors:errors,",
        "                type:this.resourceIdentifier",
        "            }",
        "        }",
        "        return out;",
		"    }",
	)
	u.TryWrite(f,
		"    protected prepareQueue(module:Module,param:any){}",
	)
	u.TryWrite(f,
		"    protected generateObject(){",
		"        return {",
	)
	for _,v := range config.Attributes{
		u.TryWrite(f,u.Indent(3,v.GenerateGenerate()))
	}
	u.TryWrite(f,
		"        };",
		"    }",
	)
	u.TryWrite(f,
		"    protected generateName(){return ''}",
	)
	u.TryWrite(f,
		"    //#endregion",
		"}",
	)

	for _,v:= range config.Attributes{
		if in:=v.GenerateInterfaces();in!=""{
			u.TryWrite(f,in)
		}
	}
	for _,v:= range config.Comp{
		if in:=v.GenerateInterfaces();in!=""{
			u.TryWrite(f,in)
		}
	}
}