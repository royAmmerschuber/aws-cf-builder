package generator
import (
	"os"
	"path/filepath"

	u "bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/util"
	"bitbucket.org/RoyAmmerschuber/terraformbuilder/internal/config"
	"github.com/iancoleman/strcase"
)
func generateProvider(basePath string,conf config.ProviderConfig){
	config:=conf.Conf
	f,err := os.Create(filepath.Join(basePath,"provider.ts"))
	if err!=nil{
		panic(err)
	}
	defer f.Close()
	className:=strcase.ToCamel(config.Name)
	u.TryWrite(f,
		"import { SMap, ResourceError } from '"+GeneralPath+"general'",
		"import { Provider } from '"+GeneralPath+"provider'",
		"import { Module } from '"+GeneralPath+"module'",
		"import { Field } from '"+GeneralPath+"field'",
	)
	u.TryWrite(f,
		"export class "+className+" extends Provider{",
		"    protected readonly resourceIdentifier='"+config.Name+"';",
		"    //#region Parameters",
	)
	for _,v := range config.Attributes{
		u.TryWrite(f,u.Indent(1,v.GenerateParameters()))
	}
	u.TryWrite(f,
		"    //#endregion",
		"",
		"    constructor(){super(0)}",
		"",
		"    //#region simpleResources",
	)
	for _,v := range config.Attributes{
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
		"    //#endregion",
		"}",
	)
	for _,v:=range conf.Interfaces{
		u.TryWrite(f,v.Generate())
	}
}

